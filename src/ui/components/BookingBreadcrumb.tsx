import React from 'react'

interface BreadcrumbStep {
  id: string
  label: string
  path: string
}

interface BookingBreadcrumbProps {
  currentStep: string
}

export default function BookingBreadcrumb({ currentStep }: BookingBreadcrumbProps) {
  const steps: BreadcrumbStep[] = [
    { id: 'select', label: 'Chọn phim / Rạp / Suất', path: '/booking/select' },
    { id: 'seats', label: 'Chọn ghế', path: '/booking/seats' },
    { id: 'combos', label: 'Chọn thức ăn', path: '/booking/combos' },
    { id: 'payment', label: 'Thanh toán', path: '/booking/payment' },
    { id: 'confirm', label: 'Xác nhận', path: '/booking/confirm' }
  ]

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep)
  }

  const currentIndex = getCurrentStepIndex()
  const progressPercent = Math.max(0, Math.min(100, Math.round(((currentIndex + 1) / steps.length) * 100)))

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative pb-2">
            <div className="flex items-center justify-center gap-6 md:gap-8">
              {steps.map((step, index) => (
                <span
                  key={step.id}
                  className={`text-sm md:text-base font-medium pb-1 ${index === currentIndex ? 'text-orange-600' : 'text-gray-500'}`}
                >
                  {step.label}
                </span>
              ))}
            </div>
            {/* Chỉ giữ đường kẻ xám, bỏ thanh chạy màu cam */}
            <div className="absolute -bottom-px left-0 right-0 h-[2px] bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  )
}