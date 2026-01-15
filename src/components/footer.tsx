'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function Footer() {
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <p className="font-serif text-lg font-semibold mb-3">LECPIN</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI와 함께하는
                <br />
                실습 중심 학습 플랫폼
              </p>
            </div>

            {/* Support */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                지원
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/guide"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    이용 가이드
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                법적 고지
              </p>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setTermsOpen(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    이용약관
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPrivacyOpen(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    개인정보처리방침
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              2026 (주)LECPIN. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* 이용약관 모달 */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>이용약관</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-4">
            <p className="font-medium text-foreground">제1조 (목적)</p>
            <p>
              본 약관은 (주)LECPIN(이하 &quot;회사&quot;)이 제공하는 AI 기반
              실습 학습 플랫폼 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로
              합니다.
            </p>

            <p className="font-medium text-foreground">제2조 (정의)</p>
            <p>
              1. &quot;서비스&quot;란 회사가 제공하는 강의 분석, 실습 과제 생성,
              AI 코드 리뷰 등의 학습 지원 서비스를 말합니다.
              <br />
              2. &quot;이용자&quot;란 본 약관에 따라 회사가 제공하는 서비스를
              이용하는 자를 말합니다.
              <br />
              3. &quot;계정&quot;이란 이용자가 서비스를 이용하기 위해 GitHub
              OAuth를 통해 생성한 고유 식별 정보를 말합니다.
            </p>

            <p className="font-medium text-foreground">제3조 (서비스의 제공)</p>
            <p>
              회사는 다음과 같은 서비스를 제공합니다:
              <br />
              1. 프로그래밍 강의 영상 분석 및 핵심 역량 추출
              <br />
              2. 맞춤형 실습 과제 생성
              <br />
              3. GitHub 레포지토리 기반 과제 관리
              <br />
              4. AI 기반 코드 리뷰 및 피드백
            </p>

            <p className="font-medium text-foreground">제4조 (이용자의 의무)</p>
            <p>
              1. 이용자는 서비스 이용 시 관련 법령 및 본 약관을 준수해야 합니다.
              <br />
              2. 이용자는 타인의 저작권을 침해하는 코드를 제출해서는 안 됩니다.
              <br />
              3. 이용자는 서비스를 부정한 목적으로 사용해서는 안 됩니다.
            </p>

            <p className="font-medium text-foreground">제5조 (면책조항)</p>
            <p>
              1. AI가 제공하는 코드 리뷰 및 피드백은 참고용이며, 회사는 그
              정확성을 보장하지 않습니다.
              <br />
              2. 회사는 이용자의 코드로 인해 발생하는 문제에 대해 책임지지
              않습니다.
            </p>

            <p className="text-xs text-muted-foreground mt-6">
              시행일: 2025년 1월 1일
              <br />
              (주)LECPIN
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* 개인정보처리방침 모달 */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>개인정보처리방침</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-4">
            <p className="font-medium text-foreground">
              1. 개인정보의 수집 및 이용 목적
            </p>
            <p>
              (주)LECPIN은 다음의 목적을 위해 개인정보를 수집 및 이용합니다:
              <br />
              - 서비스 제공 및 계정 관리
              <br />
              - GitHub 연동을 통한 과제 레포지토리 생성
              <br />- AI 코드 리뷰 서비스 제공
            </p>

            <p className="font-medium text-foreground">
              2. 수집하는 개인정보 항목
            </p>
            <p>
              회사는 GitHub OAuth를 통해 다음 정보를 수집합니다:
              <br />
              - GitHub 사용자 ID 및 사용자명
              <br />
              - GitHub 이메일 주소
              <br />
              - GitHub 프로필 이미지 URL
              <br />- GitHub 액세스 토큰 (레포지토리 생성용)
            </p>

            <p className="font-medium text-foreground">
              3. 개인정보의 보유 및 이용 기간
            </p>
            <p>
              회사는 이용자의 개인정보를 서비스 이용 기간 동안 보유합니다. 회원
              탈퇴 시 관련 법령에 따른 보존 기간을 제외하고 지체 없이
              파기합니다.
            </p>

            <p className="font-medium text-foreground">
              4. 개인정보의 제3자 제공
            </p>
            <p>
              회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
              단, 법령에 따른 요청이 있는 경우는 예외로 합니다.
            </p>

            <p className="font-medium text-foreground">
              5. 개인정보 보호책임자
            </p>
            <p>
              성명: LECPIN 개인정보보호팀
              <br />
              이메일: privacy@lecpin.com
            </p>

            <p className="font-medium text-foreground">6. 정보주체의 권리</p>
            <p>
              이용자는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제,
              처리정지를 요청할 수 있습니다.
            </p>

            <p className="text-xs text-muted-foreground mt-6">
              시행일: 2025년 1월 1일
              <br />
              (주)LECPIN
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
