"use client"

import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

interface OnboardingTourProps {
  onComplete: () => void
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  useEffect(() => {
    const driverObj = driver({
      // UI Configuration
      showProgress: true,
      progressText: '{{current}} / {{total}}',
      showButtons: [], // 버튼 숨김

      // Behavior
      allowClose: false,
      animate: true,
      overlayOpacity: 0.75,
      smoothScroll: true,

      // Styling
      popoverClass: 'driverjs-theme',

      // 힌트 텍스트 추가 및 버튼 숨기기
      onPopoverRender: (popover) => {
        // 버튼 강제 숨김
        const buttons = popover.wrapper.querySelectorAll('.driver-popover-next-btn, .driver-popover-prev-btn, .driver-popover-close-btn')
        buttons.forEach((btn) => {
          (btn as HTMLElement).style.display = 'none'
        })

        // 힌트 텍스트 추가
        const footer = document.createElement('div')
        footer.style.cssText = 'padding: 12px 15px 15px; text-align: center; color: #64748b; font-size: 13px;'
        footer.textContent = '이곳을 눌러 다음 →'
        popover.description.parentElement?.appendChild(footer)
      },

      // Popover 클릭으로 다음 단계
      onHighlighted: () => {
        setTimeout(() => {
          const popover = document.querySelector('.driver-popover')
          if (popover) {
            popover.addEventListener('click', () => {
              if (driverObj.hasNextStep()) {
                driverObj.moveNext()
              } else {
                driverObj.destroy()
              }
            }, { once: true })
          }
        }, 100)
      },

      // Tour Steps
      steps: [
        {
          popover: {
            title: 'Lecpin에 오신 것을 환영합니다',
            description: '강의를 분석하고 맞춤형 실습 과제를 생성하는 AI 기반 학습 플랫폼입니다. 간단한 투어를 통해 Lecpin의 핵심 기능을 알아보세요.',
            side: 'over', // Modal-style intro
          }
        },
        {
          element: '#onboarding-step-input',
          popover: {
            title: '1. 강의 URL 입력',
            description: 'YouTube 강의 URL을 입력하면 AI가 자동으로 자막을 추출하고 핵심 역량을 분석합니다. 1-2분 정도 소요됩니다.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#onboarding-step-competencies',
          popover: {
            title: '2. 역량 분석 결과',
            description: 'AI가 강의에서 추출한 핵심 개발 역량입니다. 각 역량은 구체적인 설명과 함께 제공되어 학습 목표를 명확히 합니다.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#onboarding-step-task',
          popover: {
            title: '3. 맞춤형 실습 과제',
            description: '분석된 역량을 바탕으로 AI가 생성한 실습 과제입니다. 난이도, 예상 시간, 기술 스택과 함께 단계별 가이드를 제공합니다.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#onboarding-step-feedback',
          popover: {
            title: '4. AI 피드백',
            description: '코드 제출 후 시니어 개발자 수준의 상세한 피드백을 받을 수 있습니다. 잘한 점, 개선 포인트, 다음 학습 추천까지 제공합니다.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#onboarding-step-stats',
          popover: {
            title: '5. 학습 진행 현황',
            description: '대시보드에서 진행 중인 과제와 완료한 과제를 한눈에 관리할 수 있습니다. 이제 Lecpin을 시작할 준비가 되었습니다!',
            side: 'bottom',
            align: 'center'
          }
        }
      ],

      // Lifecycle Callbacks
      onDestroyed: () => {
        onComplete()
      }
    })

    // Start tour after small delay for smooth rendering
    const timer = setTimeout(() => {
      driverObj.drive()
    }, 500)

    return () => {
      clearTimeout(timer)
      driverObj.destroy()
    }
  }, [onComplete])

  return null
}
