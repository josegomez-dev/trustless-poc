'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/stellar-wallet-hooks'
import { 
  useInitializeEscrow, 
  useFundEscrow, 
  useChangeMilestoneStatus, 
  useApproveMilestone, 
  useReleaseFunds 
} from '@/lib/mock-trustless-work'
import { assetConfig } from '@/lib/wallet-config'

interface DemoStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed' | 'current'
  action?: () => void
  disabled?: boolean
}

export const HelloMilestoneDemo = () => {
  const { walletData, isConnected } = useWallet()
  const [currentStep, setCurrentStep] = useState(0)
  const [contractId, setContractId] = useState<string>('')
  const [escrowData, setEscrowData] = useState<any>(null)
  const [milestoneStatus, setMilestoneStatus] = useState<'pending' | 'completed'>('pending')

  // Hooks
  const { initializeEscrow, isLoading: isInitializing, error: initError } = useInitializeEscrow()
  const { fundEscrow, isLoading: isFunding, error: fundError } = useFundEscrow()
  const { changeMilestoneStatus, isLoading: isChangingStatus, error: statusError } = useChangeMilestoneStatus()
  const { approveMilestone, isLoading: isApproving, error: approveError } = useApproveMilestone()
  const { releaseFunds, isLoading: isReleasing, error: releaseError } = useReleaseFunds()

  const steps: DemoStep[] = [
    {
      id: 'initialize',
      title: 'Initialize Escrow',
      description: 'Create a new escrow contract with USDC',
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'pending',
      action: handleInitializeEscrow,
      disabled: !isConnected || currentStep !== 0
    },
    {
      id: 'fund',
      title: 'Fund Escrow',
      description: 'Deposit USDC into the escrow contract',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending',
      action: handleFundEscrow,
      disabled: !contractId || currentStep !== 1
    },
    {
      id: 'complete',
      title: 'Complete Milestone',
      description: 'Worker signals task completion',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending',
      action: handleCompleteMilestone,
      disabled: !contractId || currentStep !== 2
    },
    {
      id: 'approve',
      title: 'Approve Milestone',
      description: 'Client approves the completed work',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending',
      action: handleApproveMilestone,
      disabled: !contractId || currentStep !== 3
    },
    {
      id: 'release',
      title: 'Release Funds',
      description: 'Automatically release funds to worker',
      status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending',
      action: handleReleaseFunds,
      disabled: !contractId || currentStep !== 4
    }
  ]

  async function handleInitializeEscrow() {
    if (!walletData) return

    try {
      const payload = {
        escrowType: 'multi-release',
        releaseMode: 'multi-release',
        asset: assetConfig.defaultAsset,
        amount: '1000000', // 10 USDC (6 decimals)
        platformFee: assetConfig.platformFee,
        buyer: walletData.publicKey,
        seller: walletData.publicKey, // For demo, same wallet
        arbiter: walletData.publicKey, // For demo, same wallet
        terms: 'Complete Task A - Hello Milestone Demo',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          demo: 'hello-milestone',
          description: 'Simple milestone completion demo'
        }
      }

      const result = await initializeEscrow(payload)
      setContractId(result.contractId)
      setEscrowData(result.escrow)
      setCurrentStep(1)
    } catch (error) {
      console.error('Failed to initialize escrow:', error)
    }
  }

  async function handleFundEscrow() {
    if (!contractId) return

    try {
      const payload = {
        contractId,
        amount: '1000000',
        releaseMode: 'multi-release'
      }

      const result = await fundEscrow(payload)
      setEscrowData(result.escrow)
      setCurrentStep(2)
    } catch (error) {
      console.error('Failed to fund escrow:', error)
    }
  }

  async function handleCompleteMilestone() {
    if (!contractId) return

    try {
      const payload = {
        contractId,
        milestoneId: 'release_1',
        status: 'completed',
        releaseMode: 'multi-release'
      }

      const result = await changeMilestoneStatus(payload)
      setEscrowData(result.escrow)
      setMilestoneStatus('completed')
      setCurrentStep(3)
    } catch (error) {
      console.error('Failed to complete milestone:', error)
    }
  }

  async function handleApproveMilestone() {
    if (!contractId) return

    try {
      const payload = {
        contractId,
        milestoneId: 'release_1',
        releaseMode: 'multi-release'
      }

      const result = await approveMilestone(payload)
      setEscrowData(result.escrow)
      setCurrentStep(4)
    } catch (error) {
      console.error('Failed to approve milestone:', error)
    }
  }

  async function handleReleaseFunds() {
    if (!contractId) return

    try {
      const payload = {
        contractId,
        milestoneId: 'release_1',
        releaseMode: 'multi-release'
      }

      const result = await releaseFunds(payload)
      setEscrowData(result.escrow)
      setCurrentStep(5)
    } catch (error) {
      console.error('Failed to release funds:', error)
    }
  }

  function resetDemo() {
    setCurrentStep(0)
    setContractId('')
    setEscrowData(null)
    setMilestoneStatus('pending')
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'current':
        return '🔄'
      default:
        return '⏳'
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-success-500 bg-success-500/10'
      case 'current':
        return 'border-brand-500 bg-brand-500/10'
      default:
        return 'border-neutral-500 bg-neutral-500/10'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-brand-500/20 to-brand-400/20 backdrop-blur-sm border border-brand-400/30 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-300 mb-4">
            🚀 Hello Milestone Demo
          </h2>
          <p className="text-white/80 text-lg">
            Experience the complete trustless escrow flow from start to finish
          </p>
        </div>

        {/* Demo Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Demo Progress</h3>
            {currentStep > 0 && (
              <button
                onClick={resetDemo}
                className="px-4 py-2 bg-danger-500/20 hover:bg-danger-500/30 border border-danger-400/30 rounded-lg text-danger-300 hover:text-danger-200 transition-colors"
              >
                🔄 Reset Demo
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center p-4 rounded-lg border-2 transition-all duration-300 ${getStepColor(step.status)}`}
              >
                <div className="text-2xl mr-4">{getStepIcon(step.status)}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{step.title}</h4>
                  <p className="text-sm text-white/70">{step.description}</p>
                </div>
                {step.action && (
                  <button
                    onClick={step.action}
                    disabled={step.disabled}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                      step.disabled
                        ? 'bg-neutral-500/20 text-neutral-400 cursor-not-allowed'
                        : 'bg-brand-500/20 hover:bg-brand-500/30 border border-brand-400/30 text-brand-300 hover:text-brand-200'
                    } ${step.id === 'initialize' ? 'initialize-escrow-button' : ''} ${step.id === 'fund' ? 'fund-escrow-button' : ''} ${step.id === 'complete' ? 'complete-milestone-button' : ''} ${step.id === 'approve' ? 'approve-milestone-button' : ''} ${step.id === 'release' ? 'release-funds-button' : ''}`}
                    data-step-id={step.id}
                  >
                    {isInitializing && step.id === 'initialize' ? 'Initializing...' :
                     isFunding && step.id === 'fund' ? 'Funding...' :
                     isChangingStatus && step.id === 'complete' ? 'Completing...' :
                     isApproving && step.id === 'approve' ? 'Approving...' :
                     isReleasing && step.id === 'release' ? 'Releasing...' :
                     'Execute'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contract Information */}
        {contractId && (
          <div className="mb-8 p-6 bg-white/5 rounded-lg border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Contract Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/70">Contract ID:</p>
                <p className="font-mono text-brand-300 bg-brand-900/30 px-2 py-1 rounded">
                  {contractId.slice(0, 20)}...
                </p>
              </div>
              <div>
                <p className="text-white/70">Status:</p>
                <p className="text-brand-300">{escrowData?.status || 'Active'}</p>
              </div>
              <div>
                <p className="text-white/70">Amount:</p>
                <p className="text-brand-300">10 USDC</p>
              </div>
              <div>
                <p className="text-white/70">Milestone Status:</p>
                <p className={`${milestoneStatus === 'completed' ? 'text-success-300' : 'text-warning-300'}`}>
                  {milestoneStatus === 'completed' ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(initError || fundError || statusError || approveError || releaseError) && (
          <div className="p-4 bg-danger-500/20 border border-danger-400/30 rounded-lg">
            <h4 className="font-semibold text-danger-300 mb-2">Error Occurred</h4>
            <p className="text-danger-200 text-sm">
              {initError?.message || fundError?.message || statusError?.message || 
               approveError?.message || releaseError?.message}
            </p>
          </div>
        )}

        {/* Success Message */}
        {currentStep === 5 && (
          <div className="p-6 bg-success-500/20 border border-success-400/30 rounded-lg text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-success-300 mb-2">Demo Completed Successfully!</h3>
            <p className="text-green-200">
              You've successfully completed the entire trustless escrow flow. 
              Funds were automatically released upon milestone approval.
            </p>
          </div>
        )}

        {/* Demo Instructions */}
        <div className="mt-8 p-6 bg-brand-500/10 border border-brand-400/30 rounded-lg">
          <h3 className="text-lg font-semibold text-brand-300 mb-3">📚 How This Demo Works</h3>
          <ul className="text-brand-200 text-sm space-y-2">
            <li>• <strong>Initialize:</strong> Creates a smart contract on Stellar for the escrow</li>
            <li>• <strong>Fund:</strong> Locks USDC tokens in the escrow contract</li>
            <li>• <strong>Complete:</strong> Worker signals task completion (simulated)</li>
            <li>• <strong>Approve:</strong> Client approves the completed work</li>
            <li>• <strong>Release:</strong> Smart contract automatically releases funds to worker</li>
          </ul>
          <p className="text-brand-200 text-sm mt-3">
            This demonstrates the core trustless escrow flow where no third party is needed - 
            the smart contract handles everything automatically once conditions are met.
          </p>
        </div>
      </div>
    </div>
  )
}
