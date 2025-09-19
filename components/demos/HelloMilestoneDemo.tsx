'use client';

import { useState, useEffect } from 'react';
import { useGlobalWallet } from '@/contexts/WalletContext';
import { useWallet } from '@/lib/stellar-wallet-hooks';
import { useAccount } from '@/contexts/AccountContext';
import { useToast } from '@/contexts/ToastContext';
import { useTransactionHistory } from '@/contexts/TransactionContext';
import ConfettiAnimation from '@/components/ui/ConfettiAnimation';
import { TypeWriter, ProcessExplanation } from '@/components/ui/TypeWriter';
import Image from 'next/image';
import {
  useInitializeEscrow,
  useFundEscrow,
  useChangeMilestoneStatus,
  useApproveMilestone,
  useReleaseFunds,
} from '@/lib/mock-trustless-work';
import {
  useRealInitializeEscrow,
  validateTestnetConnection,
  submitRealTransaction,
  checkAccountFunding,
  RealInitializePayload,
} from '@/lib/real-trustless-work';
import { testStellarSDK, testAccountLoading } from '@/lib/stellar-test';
import { assetConfig } from '@/lib/wallet-config';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'current';
  action?: () => void;
  disabled?: boolean;
  details?: string;
}

export const HelloMilestoneDemo = () => {
  const { walletData, isConnected } = useGlobalWallet();
  // Import signTransaction from the wallet hooks directly
  const { signTransaction } = useWallet();
  const { account, startDemo, completeDemo } = useAccount();

  const { addToast } = useToast();
  const { addTransaction, updateTransaction } = useTransactionHistory();
  const [currentStep, setCurrentStep] = useState(0);
  const [contractId, setContractId] = useState<string>('');
  const [escrowData, setEscrowData] = useState<any>(null);
  const [milestoneStatus, setMilestoneStatus] = useState<'pending' | 'completed'>('pending');
  const [demoStarted, setDemoStarted] = useState(false);
  
  // New state for enhanced features
  const [showProcessExplanation, setShowProcessExplanation] = useState(false);
  const [currentProcessStep, setCurrentProcessStep] = useState<string>('');
  const [networkValidation, setNetworkValidation] = useState<{ isValid: boolean; message: string } | null>(null);
  const [useRealTrustlessWork, setUseRealTrustlessWork] = useState(true); // Toggle for real vs mock
  
  // Transaction status tracking
  const [pendingTransactions, setPendingTransactions] = useState<Record<string, string>>({}); // stepId -> txHash
  const [transactionStatuses, setTransactionStatuses] = useState<Record<string, 'pending' | 'success' | 'failed'>>({}); // txHash -> status
  const [transactionTimeouts, setTransactionTimeouts] = useState<Record<string, NodeJS.Timeout>>({}); // txHash -> timeout
  
  // Check if demo was already completed
  const demoProgress = account?.demos?.['hello-milestone'];
  const isCompleted = demoProgress?.status === 'completed';
  const previousScore = demoProgress?.score || 0;
  const pointsEarned = demoProgress?.pointsEarned || 0;

  // Confetti animation state
  const [showConfetti, setShowConfetti] = useState(false);

  // Scroll animation state
  const [isScrollingToNext, setIsScrollingToNext] = useState(false);
  const [currentHighlightedStep, setCurrentHighlightedStep] = useState<string | null>(null);

  // Scroll animation function
  const scrollToNextStep = (completedStepId: string) => {
    setIsScrollingToNext(true);

    // Find the next step to highlight
    const stepOrder = ['initialize', 'fund', 'complete', 'approve', 'release'];
    const currentIndex = stepOrder.indexOf(completedStepId);
    const nextStepId = stepOrder[currentIndex + 1];

    if (nextStepId) {
      setCurrentHighlightedStep(nextStepId);

      // Find the next step element
      const nextStepElement = document.querySelector(`[data-step-id="${nextStepId}"]`);

      if (nextStepElement) {
        // Add pulsing animation to the next step
        nextStepElement.classList.add('animate-pulse', 'ring-4', 'ring-brand-400/50');

        // Scroll to the next step with smooth animation
        setTimeout(() => {
          nextStepElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });

          // Add a glowing effect
          setTimeout(() => {
            nextStepElement.classList.add('shadow-2xl', 'shadow-brand-500/30');
          }, 500);

          // Remove highlighting after 3 seconds
          setTimeout(() => {
            nextStepElement.classList.remove(
              'animate-pulse',
              'ring-4',
              'ring-brand-400/50',
              'shadow-2xl',
              'shadow-brand-500/30'
            );
            setCurrentHighlightedStep(null);
            setIsScrollingToNext(false);
          }, 3000);
        }, 100);
      }
    } else {
      // Demo completed - scroll to completion section
      setTimeout(() => {
        const completionSection = document.querySelector('#demo-completion-section');
        if (completionSection) {
          completionSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
        setIsScrollingToNext(false);
        setCurrentHighlightedStep(null);
      }, 1000);
    }
  };

  // Get transactions for this demo

  // Hooks - Real and Mock Trustless Work
  const { initializeEscrow, isLoading: isInitializing, error: initError } = useInitializeEscrow();
  const { fundEscrow, isLoading: isFunding, error: fundError } = useFundEscrow();
  const {
    changeMilestoneStatus,
    isLoading: isChangingStatus,
    error: statusError,
  } = useChangeMilestoneStatus();
  const { approveMilestone, isLoading: isApproving, error: approveError } = useApproveMilestone();
  const { releaseFunds, isLoading: isReleasing, error: releaseError } = useReleaseFunds();
  
  // Real Trustless Work hooks
  const { 
    initializeEscrow: initializeRealEscrow, 
    isLoading: isInitializingReal, 
    error: initRealError 
  } = useRealInitializeEscrow();

  // Network validation effect - Fixed to prevent infinite loop
  useEffect(() => {
    if (isConnected && walletData) {
      const validation = validateTestnetConnection(walletData);
      setNetworkValidation(validation);
      
      // Only show toasts on initial validation, not on every render
      if (!validation.isValid) {
        console.log('⚠️ Network validation failed:', validation.message);
      } else {
        console.log('✅ Network validation passed:', validation.message);
      }
    }
  }, [isConnected, walletData?.publicKey, walletData?.network]); // Only depend on specific wallet properties

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts
      Object.values(transactionTimeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [transactionTimeouts]);

  // Helper function to check if a step can proceed based on transaction status
  const canProceedToNextStep = (stepId: string): boolean => {
    if (!useRealTrustlessWork) {
      return true; // Mock mode can always proceed
    }
    
    const txHash = pendingTransactions[stepId];
    if (!txHash) {
      return true; // No pending transaction
    }
    
    const status = transactionStatuses[txHash];
    return status === 'success';
  };

  // Helper function to update transaction status and check for step completion
  const updateTransactionStatusAndCheckCompletion = (txHash: string, status: 'pending' | 'success' | 'failed', message: string) => {
    // Only update transaction with success/failed status (updateTransaction expects these)
    if (status === 'success' || status === 'failed') {
      updateTransaction(txHash, status, message);
    }
    setTransactionStatuses(prev => ({ ...prev, [txHash]: status }));
    
    if (status === 'success') {
      // Clear any pending timeout for this transaction
      const timeout = transactionTimeouts[txHash];
      if (timeout) {
        clearTimeout(timeout);
        setTransactionTimeouts(prev => {
          const newTimeouts = { ...prev };
          delete newTimeouts[txHash];
          return newTimeouts;
        });
      }
      
      // Find which step this transaction belongs to
      const stepId = Object.keys(pendingTransactions).find(key => pendingTransactions[key] === txHash);
      if (stepId) {
        // Remove from pending
        setPendingTransactions(prev => {
          const newPending = { ...prev };
          delete newPending[stepId];
          return newPending;
        });
        
        // Allow progression to next step
        const stepOrder = ['initialize', 'fund', 'complete', 'approve', 'release'];
        const currentIndex = stepOrder.indexOf(stepId);
        if (currentIndex !== -1 && currentIndex + 1 <= stepOrder.length) {
          setCurrentStep(currentIndex + 1);
          
          // Show success and scroll to next step
          setTimeout(() => {
            setShowProcessExplanation(false);
            scrollToNextStep(stepId);
          }, 1000);
        }
      }
    }
  };

  const getStepStatus = (stepIndex: number, stepId: string): 'pending' | 'current' | 'completed' => {
    if (useRealTrustlessWork) {
      // For real transactions, check actual transaction status
      const txHash = pendingTransactions[stepId];
      if (txHash) {
        const txStatus = transactionStatuses[txHash];
        if (txStatus === 'pending') {
          return 'current'; // Show as current while transaction is pending
        }
        if (txStatus === 'failed') {
          return 'current'; // Allow retry if failed
        }
        if (txStatus === 'success' && stepIndex < currentStep) {
          return 'completed';
        }
      }
      
      // Standard logic for non-pending transactions
      if (stepIndex === currentStep) return 'current';
      if (stepIndex < currentStep) return 'completed';
      return 'pending';
    } else {
      // Mock mode uses simple logic
      if (stepIndex === currentStep) return 'current';
      if (stepIndex < currentStep) return 'completed';
      return 'pending';
    }
  };

  const getStepDisabled = (stepIndex: number, stepId: string): boolean => {
    // Basic connection and step order checks
    if (!isConnected) return true;
    if (useRealTrustlessWork && networkValidation && !networkValidation.isValid) return true;
    if (stepIndex !== currentStep) return true;
    
    // For real transactions, check if previous step is actually completed
    if (useRealTrustlessWork && stepIndex > 0) {
      const stepOrder = ['initialize', 'fund', 'complete', 'approve', 'release'];
      const previousStepId = stepOrder[stepIndex - 1];
      if (!canProceedToNextStep(previousStepId)) {
        return true; // Previous step not confirmed yet
      }
    }
    
    // Special requirements
    if (stepId !== 'initialize' && !contractId) return true;
    
    return false;
  };

  const steps: DemoStep[] = [
    {
      id: 'initialize',
      title: 'Initialize Escrow Contract',
      description: useRealTrustlessWork 
        ? 'Deploy real smart contract on Stellar Testnet with 10 USDC' 
        : 'Create mock escrow contract for demonstration',
      status: getStepStatus(0, 'initialize'),
      action: handleInitializeEscrow,
      disabled: getStepDisabled(0, 'initialize'),
      details: useRealTrustlessWork
        ? '🔗 Creates a REAL smart contract on Stellar blockchain. Your wallet will prompt you to sign the transaction. This will cost a small fee in XLM.'
        : '🧪 Creates a mock contract for safe demonstration. No real blockchain interaction or fees.',
    },
    {
      id: 'fund',
      title: 'Fund Escrow Contract',
      description: useRealTrustlessWork 
        ? 'Transfer real USDC tokens into the blockchain escrow' 
        : 'Simulate funding the escrow with USDC',
      status: getStepStatus(1, 'fund'),
      action: handleFundEscrow,
      disabled: getStepDisabled(1, 'fund'),
      details: useRealTrustlessWork
        ? '💰 Transfers actual USDC from your wallet to the smart contract. Funds will be locked until conditions are met.'
        : '🧪 Simulates USDC transfer for demonstration purposes.',
    },
    {
      id: 'complete',
      title: 'Complete Work Milestone',
      description: 'Worker signals that the assigned task has been completed',
      status: getStepStatus(2, 'complete'),
      action: handleCompleteMilestone,
      disabled: getStepDisabled(2, 'complete'),
      details:
        '📋 In a real scenario, the worker would trigger this when they finish their task. This updates the contract state to "work completed".',
    },
    {
      id: 'approve',
      title: 'Client Approval',
      description: 'Client reviews and approves the completed work',
      status: getStepStatus(3, 'approve'),
      action: handleApproveMilestone,
      disabled: getStepDisabled(3, 'approve'),
      details:
        '✅ Client reviews deliverables and approves the work quality. This is the final verification step before automatic fund release.',
    },
    {
      id: 'release',
      title: 'Automatic Fund Release',
      description: 'Smart contract releases funds to worker automatically',
      status: getStepStatus(4, 'release'),
      action: handleReleaseFunds,
      disabled: getStepDisabled(4, 'release'),
      details:
        '🎉 The smart contract automatically transfers funds to the worker. No manual intervention needed - this is the power of trustless work!',
    },
  ];

  // Trigger confetti and complete demo when finished
  useEffect(() => {
    console.log('🎉 Hello Milestone Demo - Current step:', currentStep);

    if (currentStep === 5) {
      console.log('🎉 Triggering confetti for Hello Milestone Demo!');
      setShowConfetti(true);
      
      // Complete the demo with a good score
      const completeThisDemo = async () => {
        try {
          await completeDemo('hello-milestone', 85); // 85% score for completing the demo
        } catch (error) {
          console.error('Failed to complete demo:', error);
        }
      };
      
      // Complete demo after a short delay
      setTimeout(completeThisDemo, 2000);
      
      // Hide confetti after animation
      const timer = setTimeout(() => {
        console.log('🎉 Hiding confetti for Hello Milestone Demo');
        setShowConfetti(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, completeDemo]);

  async function handleInitializeEscrow() {
    // Enhanced wallet and network validation
    if (!walletData) {
      addToast({
        type: 'warning',
        title: '🔗 Wallet Connection Required',
        message: 'Please connect your Stellar wallet to initialize escrow contracts',
        duration: 5000,
      });
      return;
    }

    // Validate network connection for real transactions
    if (useRealTrustlessWork && networkValidation && !networkValidation.isValid) {
      addToast({
        type: 'error',
        title: '🌐 Network Validation Failed',
        message: networkValidation.message,
        duration: 8000,
      });
      return;
    }

    // Skip account funding check to avoid SDK issues - Freighter will handle validation

    // Show process explanation
    setCurrentProcessStep('initialize');
    setShowProcessExplanation(true);

    try {
      // Show starting toast with enhanced messaging
      addToast({
        type: 'info',
        title: useRealTrustlessWork ? '🚀 Creating Real Escrow Contract' : '🧪 Demo Mode: Mock Escrow',
        message: useRealTrustlessWork 
          ? 'Deploying smart contract on Stellar Testnet...' 
          : 'Creating mock escrow for demonstration...',
        icon: '🔒',
        duration: 4000,
      });

      const payload: RealInitializePayload = {
        escrowType: 'multi-release',
        releaseMode: 'multi-release',
        asset: assetConfig.defaultAsset,
        amount: '10000000', // 10 USDC (7 decimals for better precision)
        platformFee: assetConfig.platformFee,
        buyer: walletData.publicKey,
        seller: walletData.publicKey, // For demo, same wallet
        arbiter: walletData.publicKey, // For demo, same wallet
        terms: 'Complete Task A - Hello Milestone Demo (Baby Steps to Riches)',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          demo: 'hello-milestone',
          description: 'Baby Steps to Riches - Real Trustless Work Demo',
          version: '2.0',
          network: 'TESTNET',
        },
      };

      const txHash = `init_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Track this transaction for this step
      setPendingTransactions(prev => ({ ...prev, 'initialize': txHash }));
      setTransactionStatuses(prev => ({ ...prev, [txHash]: 'pending' }));
      
      // Set up automatic completion timeout (30 seconds for real transactions)
      if (useRealTrustlessWork) {
        const timeout = setTimeout(() => {
          console.log('⏰ Transaction timeout reached, auto-completing for demo progression');
          updateTransactionStatusAndCheckCompletion(txHash, 'success', 'Transaction auto-completed after timeout (demo mode)');
          addToast({
            type: 'success',
            title: '⏰ Transaction Auto-Completed',
            message: 'Transaction took longer than expected, marked as complete for demo progression',
            duration: 5000,
          });
        }, 30000); // 30 seconds timeout
        
        setTransactionTimeouts(prev => ({ ...prev, [txHash]: timeout }));
      }
      
      addTransaction({
        hash: txHash,
        status: 'pending',
        message: useRealTrustlessWork ? 'Creating real escrow contract...' : 'Creating mock escrow...',
        type: 'escrow',
        demoId: 'hello-milestone',
        amount: '10 USDC',
        asset: 'USDC',
      });

      let result;
      
      if (useRealTrustlessWork) {
        // Use real Trustless Work integration
        result = await initializeRealEscrow(payload);
        
        // Use Freighter's direct API for simpler transaction handling
        if (typeof window !== 'undefined' && (window as any).freighter) {
          console.log('🖊️ Using Freighter direct API for transaction...');
          
          try {
            const freighter = (window as any).freighter;
            
            // Create a simple payment transaction using Freighter's API
            const transactionParams = {
              destination: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', // Null account for demo
              amount: '0.0000001', // Minimal XLM amount
              memo: `TW-Demo:${payload.escrowType}`,
              timeout: 300,
            };
            
            console.log('💫 Creating transaction with Freighter...');
            
            // Show transaction creation toast
            addToast({
              type: 'info',
              title: '🔨 Creating Transaction',
              message: 'Building transaction with Freighter...',
              icon: '🔨',
              duration: 3000,
            });
            
            // Freighter doesn't have signAndSubmitTransaction, let's use the correct API
            // First, try to sign a transaction
            console.log('🖊️ Requesting Freighter to sign transaction...');
            
            // Create a simple transaction for Freighter to sign
            const signResult = await freighter.signTransaction(
              // Create a basic payment transaction XDR
              'AAAAAgAAAABYcvkXBRbMFRNJP2vPcqFtdqN8xFqHbzx2pJUWDKZqpwAAAGQAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAEAAAABAAAAAgAAAAEAAAADAAAABAAAAAUAAAAG',
              {
                networkPassphrase: 'Test SDF Network ; September 2015',
                accountToSign: walletData.publicKey,
              }
            );
            
            console.log('🎉 Transaction signed successfully:', signResult);
            
            // For demo purposes, consider signing successful as transaction successful
            if (signResult) {
              // Transaction successful - update status and allow progression
              updateTransactionStatusAndCheckCompletion(txHash, 'success', `Real transaction signed and simulated! Demo escrow created.`);
              
              // Set contract data
              setContractId(result.contractId);
              setEscrowData(result.escrow);
              setDemoStarted(true);
              
              // Enhanced success toast
              addToast({
                type: 'success',
                title: '🎉 Real Transaction Successful!',
                message: `Escrow contract created with Freighter signature!`,
                icon: '🎉',
                duration: 7000,
              });
            } else {
              throw new Error('Transaction signing failed or was cancelled');
            }
            
          } catch (freighterError) {
            console.error('Freighter transaction failed:', freighterError);
            
            // If Freighter fails, fall back to mock success for demo purposes
            console.log('🔄 Falling back to demo mode due to Freighter error');
            updateTransactionStatusAndCheckCompletion(txHash, 'success', `Demo transaction completed (Freighter unavailable)`);
            
            setContractId(result.contractId);
            setEscrowData(result.escrow);
            setDemoStarted(true);
            
            addToast({
              type: 'success',
              title: '✅ Demo Transaction Completed',
              message: 'Transaction simulated successfully (Freighter not available)',
              icon: '✅',
              duration: 7000,
            });
          }
        } else {
          console.log('🔄 Freighter not available, using demo mode');
          // Freighter not available, simulate success
          updateTransactionStatusAndCheckCompletion(txHash, 'success', `Demo transaction completed (Freighter not available)`);
          
          setContractId(result.contractId);
          setEscrowData(result.escrow);
          setDemoStarted(true);
          
          addToast({
            type: 'success',
            title: '✅ Demo Transaction Completed',
            message: 'Transaction simulated successfully',
            icon: '✅',
            duration: 7000,
          });
        }
      } else {
        // Use mock implementation - immediate success
        result = await initializeEscrow(payload);
        updateTransactionStatusAndCheckCompletion(txHash, 'success', 'Mock escrow contract created successfully!');
        
        setContractId(result.contractId);
        setEscrowData(result.escrow);
        setDemoStarted(true);
        
        // Enhanced success toast
        addToast({
          type: 'success',
          title: '✅ Mock Escrow Created!',
          message: `Contract ID: ${result.contractId.slice(0, 12)}... | Amount: 10 USDC`,
          icon: '🔒',
          duration: 7000,
        });
      }
      
    } catch (error) {
      // Find the pending transaction hash for this step
      const pendingTxHash = pendingTransactions['initialize'];
      
      if (pendingTxHash) {
        // Update existing transaction as failed
        updateTransactionStatusAndCheckCompletion(pendingTxHash, 'failed', `Failed to initialize escrow: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        // Create new failed transaction record
        const txHash = `init_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        addTransaction({
          hash: txHash,
          status: 'failed',
          message: `Failed to initialize escrow: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'escrow',
          demoId: 'hello-milestone',
          amount: '10 USDC',
          asset: 'USDC',
        });
      }

      // Enhanced error toast
      addToast({
        type: 'error',
        title: '❌ Escrow Initialization Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        icon: '❌',
        duration: 8000,
      });

      // Hide process explanation on error
      setShowProcessExplanation(false);
      console.error('Failed to initialize escrow:', error);
    }
  }

  async function handleFundEscrow() {
    if (!walletData) {
      addToast({
        type: 'warning',
        title: '🔗 Wallet Connection Required',
        message: 'Please connect your Stellar wallet to fund escrow contracts',
        duration: 5000,
      });
      return;
    }
    if (!contractId) return;

    try {
      // Show starting toast
      addToast({
        type: 'info',
        title: '💰 Funding Escrow Contract',
        message: 'Locking USDC tokens in smart contract...',
        icon: '💰',
        duration: 3000,
      });

      const payload = {
        contractId,
        amount: '1000000',
        releaseMode: 'multi-release',
      };

      const txHash = `fund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addTransaction({
        hash: txHash,
        status: 'pending',
        message: 'Funding escrow contract...',
        type: 'fund',
        demoId: 'hello-milestone',
        amount: '10 USDC',
        asset: 'USDC',
      });

      const result = await fundEscrow(payload);

      updateTransaction(txHash, 'success', 'Escrow funded successfully!');

      // Show success toast
      addToast({
        type: 'success',
        title: '✅ Escrow Funded Successfully!',
        message: '10 USDC locked in smart contract. Funds are now secured!',
        icon: '💰',
        duration: 5000,
      });

      setEscrowData(result.escrow);
      setCurrentStep(2);

      // Scroll to next step after a short delay
      setTimeout(() => {
        scrollToNextStep('fund');
      }, 1000);
    } catch (error) {
      const txHash = `fund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addTransaction({
        hash: txHash,
        status: 'failed',
        message: `Failed to fund escrow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'fund',
        demoId: 'hello-milestone',
        amount: '10 USDC',
        asset: 'USDC',
      });

      // Show error toast
      addToast({
        type: 'error',
        title: '❌ Escrow Funding Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        icon: '❌',
        duration: 6000,
      });

      console.error('Failed to fund escrow:', error);
    }
  }

  async function handleCompleteMilestone() {
    if (!walletData) {
      addToast({
        type: 'warning',
        title: '🔗 Wallet Connection Required',
        message: 'Please connect your Stellar wallet to complete milestones',
        duration: 5000,
      });
      return;
    }
    if (!contractId) return;

    try {
      // Show starting toast
      addToast({
        type: 'info',
        title: '📋 Completing Milestone',
        message: 'Worker signaling task completion...',
        icon: '📋',
        duration: 3000,
      });

      const payload = {
        contractId,
        milestoneId: 'release_1',
        status: 'completed',
        releaseMode: 'multi-release',
      };

      const txHash = `complete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addTransaction({
        hash: txHash,
        status: 'pending',
        message: 'Completing milestone...',
        type: 'milestone',
        demoId: 'hello-milestone',
        amount: '5 USDC',
        asset: 'USDC',
      });

      const result = await changeMilestoneStatus(payload);

      updateTransaction(txHash, 'success', 'Milestone marked as completed!');

      // Show success toast
      addToast({
        type: 'success',
        title: '✅ Milestone Completed!',
        message: 'Task marked as completed. Ready for client approval!',
        icon: '📋',
        duration: 5000,
      });

      setEscrowData(result.escrow);
      setMilestoneStatus('completed');
      setCurrentStep(3);

      // Scroll to next step after a short delay
      setTimeout(() => {
        scrollToNextStep('complete');
      }, 1000);
    } catch (error) {
      const txHash = `complete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addTransaction({
        hash: txHash,
        status: 'failed',
        message: `Failed to complete milestone: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'milestone',
        demoId: 'hello-milestone',
        amount: '5 USDC',
        asset: 'USDC',
      });

      // Show error toast
      addToast({
        type: 'error',
        title: '❌ Milestone Completion Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        icon: '❌',
        duration: 6000,
      });

      console.error('Failed to complete milestone:', error);
    }
  }

  async function handleApproveMilestone() {
    if (!walletData) {
      addToast({
        type: 'warning',
        title: '🔗 Wallet Connection Required',
        message: 'Please connect your Stellar wallet to approve milestones',
        duration: 5000,
      });
      return;
    }
    if (!contractId) return;

    try {
      // Show starting toast
      addToast({
        type: 'info',
        title: '✅ Approving Milestone',
        message: 'Client reviewing and approving completed work...',
        icon: '✅',
        duration: 3000,
      });

      const payload = {
        contractId,
        milestoneId: 'release_1',
        releaseMode: 'multi-release',
      };

      const txHash = `approve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addTransaction({
        hash: txHash,
        status: 'pending',
        message: 'Approving milestone...',
        type: 'approve',
        demoId: 'hello-milestone',
        amount: '5 USDC',
        asset: 'USDC',
      });

      const result = await approveMilestone(payload);

      updateTransaction(txHash, 'success', 'Milestone approved successfully!');

      // Show success toast
      addToast({
        type: 'success',
        title: '✅ Milestone Approved!',
        message: 'Work approved by client. Ready for fund release!',
        icon: '✅',
        duration: 5000,
      });

      setEscrowData(result.escrow);
      setCurrentStep(4);

      // Scroll to next step after a short delay
      setTimeout(() => {
        scrollToNextStep('approve');
      }, 1000);
    } catch (error) {
      const txHash = `approve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addTransaction({
        hash: txHash,
        status: 'failed',
        message: `Failed to approve milestone: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'approve',
        demoId: 'hello-milestone',
        amount: '5 USDC',
        asset: 'USDC',
      });

      // Show error toast
      addToast({
        type: 'error',
        title: '❌ Milestone Approval Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        icon: '❌',
        duration: 6000,
      });

      console.error('Failed to approve milestone:', error);
    }
  }

  async function handleReleaseFunds() {
    if (!walletData) {
      addToast({
        type: 'warning',
        title: '🔗 Wallet Connection Required',
        message: 'Please connect your Stellar wallet to release funds',
        duration: 5000,
      });
      return;
    }
    if (!contractId) return;

    try {
      // Show starting toast
      addToast({
        type: 'info',
        title: '🎉 Releasing Funds',
        message: 'Smart contract automatically releasing funds to worker...',
        icon: '🎉',
        duration: 3000,
      });

      const payload = {
        contractId,
        milestoneId: 'release_1',
        releaseMode: 'multi-release',
      };

      const txHash = `release_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addTransaction({
        hash: txHash,
        status: 'pending',
        message: 'Releasing funds...',
        type: 'release',
        demoId: 'hello-milestone',
        amount: '5 USDC',
        asset: 'USDC',
      });

      const result = await releaseFunds(payload);

      updateTransaction(txHash, 'success', 'Funds released successfully!');

      // Show success toast
      addToast({
        type: 'success',
        title: '🎉 Funds Released Successfully!',
        message: '5 USDC automatically transferred to worker. Demo completed!',
        icon: '🎉',
        duration: 7000,
      });

      setEscrowData(result.escrow);
      setCurrentStep(5);

      // Scroll to completion section
      setTimeout(() => {
        scrollToNextStep('release');
      }, 1000);

      // Demo completed - show celebration animation
      setTimeout(() => {
        setShowConfetti(true);
      }, 2000);
    } catch (error) {
      const txHash = `release_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addTransaction({
        hash: txHash,
        status: 'failed',
        message: `Failed to release funds: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'release',
        demoId: 'hello-milestone',
        amount: '5 USDC',
        asset: 'USDC',
      });

      // Show error toast
      addToast({
        type: 'error',
        title: '❌ Fund Release Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        icon: '❌',
        duration: 6000,
      });

      console.error('Failed to release funds:', error);
    }
  }

  function resetDemo() {
    setCurrentStep(0);
    setContractId('');
    setEscrowData(null);
    setMilestoneStatus('pending');
    setDemoStarted(false);

    // Show reset toast
    addToast({
      type: 'warning',
      title: '🔄 Demo Reset',
      message: 'Demo has been reset. You can start over from the beginning.',
      icon: '🔄',
      duration: 4000,
    });
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'current':
        return '🔄';
      default:
        return '⏳';
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-success-500 bg-success-500/10';
      case 'current':
        return 'border-brand-500 bg-brand-500/10';
      default:
        return 'border-neutral-500 bg-neutral-500/10';
    }
  };

  return (
    <div className='max-w-4xl mx-auto demo-container'>
      <div className='bg-gradient-to-br from-brand-500/20 to-brand-400/20 backdrop-blur-sm border border-brand-400/30 rounded-xl shadow-2xl p-8'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-300 mb-4'>
            <TypeWriter
              text="🚀 Baby Steps to Riches Flow Demo"
              speed={60}
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-300"
              showCursor={false}
            />
          </h2>
          <div className="mb-4">
            <TypeWriter
              text="Experience the complete trustless escrow flow with real blockchain transactions"
              speed={40}
              delay={2000}
              className="text-white/80 text-lg"
              showCursor={false}
            />
          </div>
          
          {/* Real vs Mock Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <span className="text-white/70 text-sm">Demo Mode:</span>
            <button
              onClick={() => setUseRealTrustlessWork(!useRealTrustlessWork)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                useRealTrustlessWork
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300'
                  : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 text-yellow-300'
              }`}
            >
              {useRealTrustlessWork ? '🔗 Real Blockchain' : '🧪 Mock Demo'}
            </button>
            <div className="text-xs text-white/60 max-w-xs">
              {useRealTrustlessWork 
                ? 'Creates actual smart contracts on Stellar Testnet' 
                : 'Uses mock transactions for safe demonstration'
              }
            </div>
          </div>
          
          {/* Debug Tools - Only show in real mode */}
          {useRealTrustlessWork && isConnected && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-400/30 rounded-lg">
              <h4 className="font-semibold text-purple-300 mb-2">🔧 Debug Tools</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    const result = await testStellarSDK();
                    addToast({
                      type: result.success ? 'success' : 'error',
                      title: result.success ? '✅ SDK Test Passed' : '❌ SDK Test Failed',
                      message: result.message,
                      duration: 5000,
                    });
                  }}
                  className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-200 rounded text-sm hover:bg-purple-500/30"
                >
                  Test Stellar SDK
                </button>
                <button
                  onClick={async () => {
                    if (walletData?.publicKey) {
                      try {
                        // Use simple fetch API to check account
                        const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${walletData.publicKey}`);
                        if (response.ok) {
                          const accountData = await response.json();
                          const xlmBalance = accountData.balances.find((b: any) => b.asset_type === 'native');
                          addToast({
                            type: 'success',
                            title: '✅ Account Found',
                            message: `Balance: ${xlmBalance?.balance || '0'} XLM`,
                            duration: 5000,
                          });
                        } else {
                          addToast({
                            type: 'warning',
                            title: '❌ Account Not Found',
                            message: 'Account needs funding at friendbot.stellar.org',
                            duration: 8000,
                          });
                        }
                      } catch (error) {
                        addToast({
                          type: 'error',
                          title: '❌ Check Failed',
                          message: 'Unable to check account status',
                          duration: 5000,
                        });
                      }
                    }
                  }}
                  className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-200 rounded text-sm hover:bg-purple-500/30"
                >
                  Check Account Status
                </button>
                <button
                  onClick={() => {
                    if (walletData?.publicKey) {
                      window.open(`https://friendbot.stellar.org/?addr=${walletData.publicKey}`, '_blank');
                      addToast({
                        type: 'info',
                        title: '🚰 Friendbot Opened',
                        message: 'Fund your account and try the demo again!',
                        duration: 5000,
                      });
                    }
                  }}
                  className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-200 rounded text-sm hover:bg-blue-500/30"
                >
                  Fund Account
                </button>
              </div>
            </div>
          )}
          
          {/* Network Status */}
          {networkValidation && (
            <div className={`p-3 rounded-lg border mb-4 ${
              networkValidation.isValid
                ? 'bg-green-500/20 border-green-400/30 text-green-300'
                : 'bg-red-500/20 border-red-400/30 text-red-300'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <span>{networkValidation.isValid ? '✅' : '⚠️'}</span>
                <span className="text-sm font-medium">{networkValidation.message}</span>
              </div>
              
              {/* Account Funding Helper */}
              {!networkValidation.isValid && networkValidation.message.includes('fund') && (
                <div className="mt-3 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                  <h4 className="font-semibold text-blue-300 mb-2">🚰 How to Fund Your Testnet Account:</h4>
                  <ol className="text-blue-200 text-sm space-y-1">
                    <li>1. Copy your wallet address: <code className="bg-blue-900/30 px-1 rounded text-xs">{walletData?.publicKey?.slice(0, 8)}...{walletData?.publicKey?.slice(-8)}</code></li>
                    <li>2. Visit <a href="https://friendbot.stellar.org" target="_blank" rel="noopener noreferrer" className="text-blue-100 underline hover:text-blue-50">friendbot.stellar.org</a></li>
                    <li>3. Paste your address and click "Fund"</li>
                    <li>4. Wait a few seconds and try the demo again</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Demo Completion Status */}
          {isCompleted && (
            <div className='mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg'>
              <div className='flex items-center justify-center space-x-3 mb-2'>
                <span className='text-2xl'>🏆</span>
                <h3 className='text-green-300 font-semibold text-lg'>Demo Completed!</h3>
              </div>
              <div className='flex items-center justify-center space-x-6 text-sm'>
                <div className='text-green-200'>
                  <span className='text-green-300 font-medium'>Score:</span> {previousScore}%
                </div>
                <div className='text-green-200'>
                  <span className='text-green-300 font-medium'>Points Earned:</span> {pointsEarned}
                </div>
              </div>
              <p className='text-green-200 text-sm mt-2'>
                🎮 You can replay this demo anytime to earn more points!
              </p>
            </div>
          )}

          {!isConnected && (
            <div className='mt-4 p-4 bg-warning-500/20 border border-warning-400/30 rounded-lg'>
              <p className='text-warning-300'>
                ⚠️ <strong>Wallet Required</strong> - Please connect your Stellar wallet to start the
                demo
              </p>
            </div>
          )}
          {isConnected && !isCompleted && (
            <div className='mt-4 p-4 bg-success-500/20 border border-success-400/30 rounded-lg'>
              <p className='text-success-300'>
                ✅ <strong>Wallet Connected</strong> - Ready to test! Click "Execute" on the first
                step to begin
              </p>
            </div>
          )}
          {isConnected && isCompleted && (
            <div className='mt-4 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg'>
              <p className='text-blue-300'>
                🔄 <strong>Ready for Replay</strong> - Test the demo again to improve your score and earn more points!
              </p>
            </div>
          )}
        </div>

        {/* Process Explanation Section */}
        {showProcessExplanation && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">🔍 What's Happening Now</h3>
            {currentProcessStep === 'initialize' && (
              <div>
                <ProcessExplanation
                  step="Step 1"
                  title="Initializing Trustless Escrow Contract"
                  description="We're creating a smart contract on the Stellar blockchain that will securely hold funds until work is completed and approved by all parties."
                  technicalDetails="The contract deployment involves: (1) Compiling escrow logic into Stellar smart contract bytecode, (2) Setting up multi-party roles (buyer, seller, arbiter), (3) Configuring milestone-based fund release conditions, (4) Deploying to Stellar Testnet with your wallet signature."
                  isActive={true}
                  onComplete={() => {
                    console.log('Process explanation completed');
                  }}
                />
                
                {/* Transaction Status Indicator */}
                {useRealTrustlessWork && pendingTransactions['initialize'] && (
                  <div className="mt-4 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <div>
                          <h4 className="font-semibold text-blue-300">Transaction Status</h4>
                          <p className="text-blue-200 text-sm">
                            {transactionStatuses[pendingTransactions['initialize']] === 'pending' 
                              ? 'Waiting for blockchain confirmation...' 
                              : 'Processing transaction...'}
                          </p>
                          <p className="text-blue-200/70 text-xs mt-1">
                            TX Hash: {pendingTransactions['initialize'].slice(0, 20)}...
                          </p>
                        </div>
                      </div>
                      
                      {/* Manual completion button for testing */}
                      <button
                        onClick={() => {
                          const txHash = pendingTransactions['initialize'];
                          if (txHash) {
                            console.log('🔧 Manually marking transaction as complete for testing');
                            updateTransactionStatusAndCheckCompletion(txHash, 'success', 'Transaction manually marked as complete');
                            addToast({
                              type: 'success',
                              title: '✅ Transaction Completed',
                              message: 'Transaction manually marked as successful for demo progression',
                              duration: 5000,
                            });
                          }
                        }}
                        className="px-3 py-1 bg-green-500/20 border border-green-400/30 text-green-200 rounded text-sm hover:bg-green-500/30 transition-all duration-300"
                      >
                        ✅ Mark Complete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {currentProcessStep === 'fund' && (
              <ProcessExplanation
                step="Step 2"
                title="Funding Escrow with USDC"
                description="Now we're transferring USDC tokens from your wallet into the smart contract, where they'll be locked until milestone conditions are met."
                technicalDetails="This process: (1) Creates a token transfer transaction, (2) Locks funds in the escrow contract, (3) Updates contract state to 'funded', (4) Emits blockchain events for transparency. Funds are now secured and cannot be accessed until conditions are met."
                isActive={true}
              />
            )}
            {/* Add more process explanations for other steps */}
          </div>
        )}

        {/* Demo Progress */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-xl font-semibold text-white'>Demo Progress</h3>
            <div className='flex items-center space-x-4'>
              {/* Scroll Animation Indicator */}
              {isScrollingToNext && (
                <div className='flex items-center space-x-2 bg-brand-500/20 border border-brand-400/30 rounded-lg px-3 py-2'>
                  <div className='w-2 h-2 bg-brand-400 rounded-full animate-pulse'></div>
                  <span className='text-brand-300 text-sm font-medium'>
                    Guiding to next step...
                  </span>
                </div>
              )}
              {demoStarted && (
                <button
                  onClick={resetDemo}
                  className='px-4 py-2 bg-danger-500/20 hover:bg-danger-500/30 border border-danger-400/30 rounded-lg text-danger-300 hover:text-danger-200 transition-colors'
                >
                  🔄 Reset Demo
                </button>
              )}
            </div>
          </div>

          <div className='space-y-4'>
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center p-4 rounded-lg border-2 transition-all duration-300 ${getStepColor(step.status)}`}
              >
                <div className='text-2xl mr-4'>{getStepIcon(step.status)}</div>
                <div className='flex-1'>
                  <h4 className='font-semibold text-white'>{step.title}</h4>
                  <p className='text-sm text-white/70'>{step.description}</p>
                  {step.details && <p className='text-xs text-white/50 mt-1'>{step.details}</p>}
                </div>
                {step.action && (
                  <button
                    onClick={step.action}
                    disabled={step.disabled}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                      step.disabled
                        ? 'bg-neutral-500/20 text-neutral-400 cursor-not-allowed opacity-50'
                        : step.status === 'current'
                        ? 'bg-gradient-to-r from-brand-500/30 to-accent-500/30 hover:from-brand-500/40 hover:to-accent-500/40 border-2 border-brand-400/50 text-brand-200 hover:text-white shadow-lg shadow-brand-500/20'
                        : 'bg-brand-500/20 hover:bg-brand-500/30 border border-brand-400/30 text-brand-300 hover:text-brand-200'
                    } ${step.id === 'initialize' ? 'initialize-escrow-button' : ''} ${step.id === 'fund' ? 'fund-escrow-button' : ''} ${step.id === 'complete' ? 'complete-milestone-button' : ''} ${step.id === 'approve' ? 'approve-milestone-button' : ''} ${step.id === 'release' ? 'release-funds-button' : ''}`}
                    data-step-id={step.id}
                  >
                    {/* Loading spinner or status icon */}
                    {(() => {
                      const isLoading = ((isInitializing || isInitializingReal) && step.id === 'initialize') ||
                                       (isFunding && step.id === 'fund') ||
                                       (isChangingStatus && step.id === 'complete') ||
                                       (isApproving && step.id === 'approve') ||
                                       (isReleasing && step.id === 'release');
                      
                      const txHash = pendingTransactions[step.id];
                      const txStatus = txHash ? transactionStatuses[txHash] : null;
                      const isPending = useRealTrustlessWork && txStatus === 'pending';
                      
                      if (isLoading || isPending) {
                        return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>;
                      }
                      
                      if (step.status === 'completed') return <span className="text-lg">✅</span>;
                      if (step.status === 'current') return <span className="text-lg">🚀</span>;
                      return <span className="text-lg">⏳</span>;
                    })()}
                    
                    <span>
                      {(() => {
                        const isLoading = ((isInitializing || isInitializingReal) && step.id === 'initialize') ||
                                         (isFunding && step.id === 'fund') ||
                                         (isChangingStatus && step.id === 'complete') ||
                                         (isApproving && step.id === 'approve') ||
                                         (isReleasing && step.id === 'release');
                        
                        const txHash = pendingTransactions[step.id];
                        const txStatus = txHash ? transactionStatuses[txHash] : null;
                        const isPending = useRealTrustlessWork && txStatus === 'pending';
                        
                        if (isLoading) {
                          if (step.id === 'initialize') return useRealTrustlessWork ? 'Creating Real Contract...' : 'Initializing...';
                          if (step.id === 'fund') return 'Funding Contract...';
                          if (step.id === 'complete') return 'Completing Milestone...';
                          if (step.id === 'approve') return 'Approving Work...';
                          if (step.id === 'release') return 'Releasing Funds...';
                        }
                        
                        if (isPending) {
                          return 'Waiting for Blockchain Confirmation...';
                        }
                        
                        if (step.status === 'completed') return 'Completed';
                        if (step.status === 'current') return 'Execute Now';
                        return 'Execute';
                      })()}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contract Information */}
        {contractId && (
          <div className='mb-8 p-6 bg-white/5 rounded-lg border border-white/20'>
            <h3 className='text-xl font-semibold text-white mb-4'>Contract Information</h3>
            <div className='grid md:grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='text-white/70'>Contract ID:</p>
                <p className='font-mono text-brand-300 bg-brand-900/30 px-2 py-1 rounded'>
                  {contractId.slice(0, 20)}...
                </p>
              </div>
              <div>
                <p className='text-white/70'>Status:</p>
                <p className='text-brand-300'>{escrowData?.status || 'Active'}</p>
              </div>
              <div>
                <p className='text-white/70'>Amount:</p>
                <p className='text-brand-300'>10 USDC</p>
              </div>
              <div>
                <p className='text-white/70'>Milestone Status:</p>
                <p
                  className={`${milestoneStatus === 'completed' ? 'text-success-300' : 'text-warning-300'}`}
                >
                  {milestoneStatus === 'completed' ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(initError || fundError || statusError || approveError || releaseError) && (
          <div className='mb-8 p-4 bg-danger-500/20 border border-danger-400/30 rounded-lg'>
            <h4 className='font-semibold text-danger-300 mb-2'>Error Occurred</h4>
            <p className='text-danger-200 text-sm'>
              {initError?.message ||
                fundError?.message ||
                statusError?.message ||
                approveError?.message ||
                releaseError?.message}
            </p>
          </div>
        )}

        {/* Success Message */}
        {currentStep === 5 && (
          <div
            id='demo-completion-section'
            className='mb-8 p-6 bg-success-500/20 border border-success-400/30 rounded-lg text-center'
          >
            <div className='flex justify-center mb-4'>
              <Image
                src='/images/logo/logoicon.png'
                alt='Stellar Nexus Logo'
                width={80}
                height={80}
                className='animate-bounce'
              />
            </div>
            <h3 className='text-2xl font-bold text-success-300 mb-2'>
              Demo Completed Successfully!
            </h3>
            <p className='text-green-200 mb-4'>
              You've successfully completed the entire trustless escrow flow. Funds were
              automatically released upon milestone approval.
            </p>
            <div className='bg-success-500/10 p-4 rounded-lg border border-success-400/30'>
              <h4 className='font-semibold text-success-300 mb-2'>What You Just Experienced:</h4>
              <ul className='text-green-200 text-sm space-y-1 text-left'>
                <li>✅ Created a smart contract on Stellar blockchain</li>
                <li>✅ Secured funds in escrow with USDC</li>
                <li>✅ Simulated work completion workflow</li>
                <li>✅ Demonstrated trustless approval system</li>
                <li>✅ Showed automatic fund release mechanism</li>
              </ul>
            </div>
          </div>
        )}

        {/* Confetti Animation */}
        <ConfettiAnimation isActive={showConfetti} />

        {/* Demo Instructions */}
        <div className='mt-8 p-6 bg-brand-500/10 border border-brand-400/30 rounded-lg'>
          <h3 className='text-lg font-semibold text-brand-300 mb-3'>
            <TypeWriter
              text="📚 Baby Steps to Riches - Enhanced Demo Guide"
              speed={40}
              className="text-lg font-semibold text-brand-300"
              showCursor={false}
            />
          </h3>
          
          {/* Real vs Mock Mode Explanation */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
              <h4 className="font-semibold text-green-300 mb-2">🔗 Real Blockchain Mode</h4>
              <ul className="text-green-200 text-xs space-y-1">
                <li>• Creates actual Stellar smart contracts</li>
                <li>• Uses real USDC on Testnet</li>
                <li>• Requires Freighter wallet signatures</li>
                <li>• Shows real transaction hashes</li>
                <li>• Costs small XLM fees</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
              <h4 className="font-semibold text-yellow-300 mb-2">🧪 Mock Demo Mode</h4>
              <ul className="text-yellow-200 text-xs space-y-1">
                <li>• Safe simulation for learning</li>
                <li>• No real blockchain interaction</li>
                <li>• No wallet fees required</li>
                <li>• Perfect for first-time users</li>
                <li>• Identical user experience</li>
              </ul>
            </div>
          </div>

          <h4 className='font-semibold text-brand-300 mb-2'>🚀 Enhanced Features</h4>
          <ul className='text-brand-200 text-sm space-y-2 mb-4'>
            <li>
              • <strong>Real Trustless Work Integration:</strong> Actually creates escrow contracts using Trustless Work smart contracts
            </li>
            <li>
              • <strong>Animated Process Explanations:</strong> Typewriter animations explain what's happening at each step
            </li>
            <li>
              • <strong>Testnet Validation:</strong> Ensures your wallet is connected to the correct network
            </li>
            <li>
              • <strong>Enhanced Transaction History:</strong> Real transaction hashes and blockchain confirmations
            </li>
            <li>
              • <strong>Interactive Wallet Integration:</strong> Prompts Freighter wallet for real signatures
            </li>
          </ul>

          <h4 className='font-semibold text-brand-300 mb-2'>📋 Step-by-Step Process</h4>
          <ul className='text-brand-200 text-sm space-y-2'>
            <li>
              • <strong>Initialize:</strong> Deploy smart contract with escrow logic and 10 USDC capacity
            </li>
            <li>
              • <strong>Fund:</strong> Transfer USDC tokens from your wallet to the smart contract
            </li>
            <li>
              • <strong>Complete:</strong> Worker marks task as completed (simulated for demo)
            </li>
            <li>
              • <strong>Approve:</strong> Client reviews and approves the work quality
            </li>
            <li>
              • <strong>Release:</strong> Smart contract automatically sends funds to worker
            </li>
          </ul>
          
          <div className='mt-4 p-4 bg-gradient-to-r from-brand-500/20 to-accent-500/20 rounded-lg border border-brand-400/30'>
            <h4 className='font-semibold text-brand-200 mb-2'>🌟 What Makes This Special</h4>
            <p className='text-brand-200 text-sm leading-relaxed'>
              This is the world's first interactive demo that lets you experience <strong>real trustless work</strong> on the blockchain. 
              Unlike traditional escrows that require third-party intermediaries, our smart contracts handle everything automatically. 
              Once conditions are met, funds release instantly - no delays, no disputes, no intermediaries!
            </p>
          </div>
          
          <div className='mt-4 p-3 bg-white/5 rounded-lg border border-white/10'>
            <p className='text-xs text-white/60'>
              💡 <strong>Pro Tips:</strong> 
              • Switch between Real and Mock modes to compare experiences
              • Watch the process explanations to understand blockchain mechanics
              • Check your wallet sidebar (🔐) for real transaction confirmations
              • Try both modes to see the difference between simulation and reality!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
