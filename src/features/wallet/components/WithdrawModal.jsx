import { useState } from 'react'
import { ArrowUpFromLine, Landmark } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button, Modal, InfoBanner } from '@/shared/ui'
import { WALLET_BALANCE, BANK_ACCOUNT } from '@/services/mocks/mockData'

export default function WithdrawModal({ onClose }) {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')

  const balance    = WALLET_BALANCE.raw
  const fee        = 0
  const parsedAmt  = parseFloat(amount.replace(',', '.')) || 0
  const net        = parsedAmt - fee

  const description = (
    <>
      {t('wallet.availableBalance')}:{' '}
      <span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
        ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </span>
    </>
  )

  const footer = (
    <>
      <Button variant="outline" className="flex-1 !py-3.5" onClick={onClose}>{t('common.cancel')}</Button>
      <Button className="flex-1 !py-3.5" disabled={parsedAmt <= 0 || parsedAmt > balance}>
        <ArrowUpFromLine size={18} /> {t('wallet.confirmWithdraw')}
      </Button>
    </>
  )

  return (
    <Modal
      onClose={onClose}
      icon={<ArrowUpFromLine size={24} />}
      title={t('wallet.withdrawTitle')}
      description={description}
      footer={footer}
    >
      <div className="p-5 sm:p-8 space-y-6">

        {/* Amount input */}
        <div>
          <label htmlFor="withdraw-amount" className={`block text-xs font-bold tracking-widest mb-3 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
            {t('wallet.withdrawAmount')}
          </label>
          <Input
            id="withdraw-amount"
            type="number"
            prefix="$"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="font-mono font-bold text-xl"
          />
          <button
            onClick={() => setAmount(balance.toFixed(2))}
            className={`mt-2 text-xs font-bold transition-colors ${isDarkMode ? 'text-[#7C3AED] hover:text-[#A78BFA]' : 'text-[#7C3AED] hover:text-[#561BAF]'}`}
          >
            {t('wallet.withdrawAll')}
          </button>
        </div>

        {/* Destination account */}
        <div className={`flex items-center gap-4 p-4 rounded-xl border ${
          isDarkMode ? 'bg-[#111113]/30 border-white/10' : 'bg-gray-50/60 border-gray-200'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/60 text-[#561BAF]'
          }`}>
            <Landmark size={18} />
          </div>
          <div>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>{t('wallet.destination')}</p>
            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
              {BANK_ACCOUNT.shortName}
            </p>
            <p className={`text-xs font-mono ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              •••• {BANK_ACCOUNT.last4}
            </p>
          </div>
        </div>

        {/* Summary */}
        {parsedAmt > 0 && (
          <div className={`p-4 rounded-xl border space-y-2 font-mono text-sm animate-fade-in ${
            isDarkMode ? 'bg-[#111113]/30 border-white/10' : 'bg-gray-50/60 border-gray-200'
          }`}>
            <div className={`flex justify-between ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
              <span>{t('wallet.requestedAmount')}</span>
              <span className="font-bold">${parsedAmt.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              <span>{t('wallet.withdrawalFee')}</span>
              <span className="text-emerald-500 font-bold">{t('common.free')}</span>
            </div>
            <div className={`flex justify-between pt-2 border-t font-bold text-base ${
              isDarkMode ? 'border-white/10 text-white' : 'border-black/5 text-[#111113]'
            }`}>
              <span>{t('wallet.totalDeposit')}</span>
              <span>${net.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Info */}
        <InfoBanner>
          {t('wallet.withdrawalProcessing')}
        </InfoBanner>
      </div>
    </Modal>
  )
}
