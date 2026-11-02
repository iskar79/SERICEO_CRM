-- =====================================================================
-- 20261102 khma : 엑셀 다운로드 보안 감사 및 사유 이력 테이블 생성 스크립트 (초경량 정비)
-- 스키마: CRM / 테이블: M_EXCEL_DOWN_LOG (총 13개 핵심 컬럼)
-- =====================================================================

-- 1. 시퀀스 생성
CREATE SEQUENCE "CRM"."SEQ_M_EXCEL_DOWN_LOG"
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

-- 2. 테이블 생성 (불필요 마스터/중복 컬럼 제거 완료)
CREATE TABLE "CRM"."M_EXCEL_DOWN_LOG" (
    "LOG_NO"       NUMBER(18)        NOT NULL,                      -- 일련번호 (PK, SEQ_M_EXCEL_DOWN_LOG.NEXTVAL)
    "M_USITE_NO"   NUMBER(10)        DEFAULT 1,                     -- 사이트/테넌트 식별자 (USITE, M_USITE_NO)
    "MENU_ID"      VARCHAR2(50),                                    -- 화면 메뉴 ID (예: 1010)
    "SERVICE_NAME" VARCHAR2(100),                                   -- 호출 백엔드 서비스명 (예: M_CONT, A_USER)
    "METHOD_NAME"  VARCHAR2(100),                                   -- 호출 백엔드 메서드명 (예: LIST, USER_LIST)
    "FILE_NAME"    VARCHAR2(300),                                   -- 생성된 엑셀 파일명
    "XLS_PURPOSE"  VARCHAR2(50),                                    -- 용도 코드 (INFO, OFF_PROMO, ADV_PROMO, ETC)
    "XLS_TARGET"   VARCHAR2(50),                                    -- 대상 코드 (ALL, EMAIL, SMS, TEL)
    "XLS_REASON"   VARCHAR2(1000)    NOT NULL,                      -- 다운로드 사유/목적 (최소 10자 이상 필수)
    "DOWN_CNT"     NUMBER(10)        DEFAULT 0,                     -- 다운로드 추출 데이터 건수
    "CLIENT_IP"    VARCHAR2(50),                                    -- 요청자 클라이언트 IP 주소
    "REGDATE"      TIMESTAMP(6)      DEFAULT SYSTIMESTAMP NOT NULL, -- 다운로드 일시 (CRM 표준 TIMESTAMP)
    "REGUSER"      VARCHAR2(50)      NOT NULL,                      -- 다운로드 실행자 식별자 (모나크 세션 UID)
    CONSTRAINT "PK_M_EXCEL_DOWN_LOG" PRIMARY KEY ("LOG_NO")
);

-- 3. 테이블 및 컬럼 코멘트 등록
COMMENT ON TABLE "CRM"."M_EXCEL_DOWN_LOG" IS '엑셀 다운로드 보안 감사 및 사유 이력 테이블';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."LOG_NO" IS '로그 일련번호 (PK)';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."M_USITE_NO" IS '사이트 식별자 (USITE)';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."MENU_ID" IS '다운로드 화면 메뉴 ID';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."SERVICE_NAME" IS '호출 백엔드 서비스명';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."METHOD_NAME" IS '호출 백엔드 메서드명';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."FILE_NAME" IS '생성된 다운로드 엑셀 파일명';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."XLS_PURPOSE" IS '다운로드 용도 (INFO, OFF_PROMO, ADV_PROMO, ETC)';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."XLS_TARGET" IS '추출 대상 (ALL, EMAIL, SMS, TEL)';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."XLS_REASON" IS '다운로드 사유/목적 (10자 이상 필수)';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."DOWN_CNT" IS '추출 데이터 건수';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."CLIENT_IP" IS '요청자 클라이언트 IP';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."REGDATE" IS '등록 일시';
COMMENT ON COLUMN "CRM"."M_EXCEL_DOWN_LOG"."REGUSER" IS '다운로드 실행자 사번/아이디 (UID)';

-- 4. 성능 최적화를 위한 인덱스 생성
CREATE INDEX "CRM"."IDX_M_EXCEL_DOWN_LOG_USER" ON "CRM"."M_EXCEL_DOWN_LOG" ("REGUSER", "REGDATE");
CREATE INDEX "CRM"."IDX_M_EXCEL_DOWN_LOG_DATE" ON "CRM"."M_EXCEL_DOWN_LOG" ("REGDATE");

-- =====================================================================
-- 5. 모나크 서비스 메타 SQL 참조 (MON_COMMON / INSERT_EXCEL_DOWN_LOG)
-- =====================================================================
/*
INSERT INTO CRM.M_EXCEL_DOWN_LOG (
    LOG_NO,
    M_USITE_NO,
    MENU_ID,
    SERVICE_NAME,
    METHOD_NAME,
    FILE_NAME,
    XLS_PURPOSE,
    XLS_TARGET,
    XLS_REASON,
    DOWN_CNT,
    CLIENT_IP,
    REGDATE,
    REGUSER
) VALUES (
    CRM.SEQ_M_EXCEL_DOWN_LOG.NEXTVAL,
    NVL(TO_NUMBER('@USITE@'), 1),
    '@MENUID@',
    '@service@',
    '@method@',
    '@fileName@',
    '@XLS_PURPOSE@',
    '@XLS_TARGET@',
    '@XLS_REASON@',
    NVL(TO_NUMBER('@totalRecord@'), 0),
    '@clientIp@',
    SYSTIMESTAMP,
    '@UID@'
)
*/
