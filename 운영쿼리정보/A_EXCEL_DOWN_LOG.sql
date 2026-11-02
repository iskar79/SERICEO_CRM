-- =====================================================================
-- 20261102 khma : 엑셀 다운로드 보안 감사 및 사유 이력 테이블 생성 스크립트
-- 기반 테이블: Mon_LinkCRM_Maven M_USER 및 운영 CEO.A_USER 표준 명명규칙 준수
-- =====================================================================

-- 1. 시퀀스 생성
CREATE SEQUENCE "CEO"."SEQ_A_EXCEL_DOWN_LOG"
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

-- 2. 테이블 생성
CREATE TABLE "CEO"."A_EXCEL_DOWN_LOG" (
    "LOG_NO"       NUMBER(18)        NOT NULL,                      -- 일련번호 (PK, SEQ_A_EXCEL_DOWN_LOG.NEXTVAL)
    "SITE"         VARCHAR2(8)       DEFAULT '1',                   -- 사이트/테넌트 식별자 (USITE, M_USITE_NO)
    "USEQ"         NUMBER(18)        NOT NULL,                      -- 다운로드 실행자 번호 (A_USER.USEQ / M_USER_NO)
    "LOGINID"      VARCHAR2(100),                                   -- 로그인 아이디
    "USER_NAME"    VARCHAR2(100),                                   -- 실행자 성명
    "DEPART"       VARCHAR2(100),                                   -- 소속 부서
    "MENU_ID"      VARCHAR2(50),                                    -- 화면 메뉴 ID (예: 1010)
    "MENU_NAME"    VARCHAR2(200),                                   -- 화면 메뉴명 / 액션명
    "SERVICE_NAME" VARCHAR2(100),                                   -- 호출 백엔드 서비스명 (예: M_CONT, A_USER)
    "METHOD_NAME"  VARCHAR2(100),                                   -- 호출 백엔드 메서드명 (예: LIST, USER_LIST)
    "FILE_NAME"    VARCHAR2(300),                                   -- 생성된 엑셀 파일명
    "XLS_PURPOSE"  VARCHAR2(50),                                    -- 용도 코드 (INFO: 정보성, OFF_PROMO: 오프라인 홍보용, ADV_PROMO: 광고성 홍보용, ETC: 기타)
    "XLS_TARGET"   VARCHAR2(50),                                    -- 대상 코드 (ALL: 전체, EMAIL: 이메일 수신, SMS: SMS 수신, TEL: 전화 수신)
    "XLS_REASON"   VARCHAR2(1000)    NOT NULL,                      -- 다운로드 사유/목적 (최소 10자 이상 필수)
    "DOWN_CNT"     NUMBER(10)        DEFAULT 0,                     -- 다운로드 추출 데이터 건수
    "CLIENT_IP"    VARCHAR2(50),                                    -- 요청자 IP 주소
    "REGTIME"      DATE              DEFAULT SYSDATE,               -- 다운로드 일시 (운영 A_USER 스타일)
    "REGUSEQ"      NUMBER(18),                                      -- 등록자 USEQ
    "USEYN"        VARCHAR2(1)       DEFAULT 'Y',                   -- 사용 여부
    CONSTRAINT "PK_A_EXCEL_DOWN_LOG" PRIMARY KEY ("LOG_NO")
);

-- 3. 테이블 및 컬럼 코멘트 등록
COMMENT ON TABLE "CEO"."A_EXCEL_DOWN_LOG" IS '엑셀 다운로드 보안 감사 및 사유 이력 테이블';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."LOG_NO" IS '로그 일련번호 (PK)';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."SITE" IS '사이트 식별자 (USITE)';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."USEQ" IS '다운로드 실행 사용자 식별번호 (A_USER.USEQ)';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."LOGINID" IS '로그인 아이디';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."USER_NAME" IS '사용자 성명';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."DEPART" IS '소속 부서';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."MENU_ID" IS '다운로드 화면 메뉴 ID';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."MENU_NAME" IS '다운로드 화면 메뉴명';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."SERVICE_NAME" IS '호출 백엔드 서비스명';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."METHOD_NAME" IS '호출 백엔드 메서드명';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."FILE_NAME" IS '다운로드 엑셀 파일명';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."XLS_PURPOSE" IS '다운로드 용도 (INFO, OFF_PROMO, ADV_PROMO, ETC)';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."XLS_TARGET" IS '추출 대상 (ALL, EMAIL, SMS, TEL)';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."XLS_REASON" IS '다운로드 사유/목적 (10자 이상 필수)';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."DOWN_CNT" IS '추출 데이터 건수';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."CLIENT_IP" IS '요청자 클라이언트 IP';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."REGTIME" IS '등록 일시';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."REGUSEQ" IS '등록자 일련번호';
COMMENT ON COLUMN "CEO"."A_EXCEL_DOWN_LOG"."USEYN" IS '사용 여부 (Y/N)';

-- 4. 성능 최적화를 위한 인덱스 생성
CREATE INDEX "CEO"."IDX_A_EXCEL_DOWN_LOG_USEQ" ON "CEO"."A_EXCEL_DOWN_LOG" ("USEQ", "REGTIME");
CREATE INDEX "CEO"."IDX_A_EXCEL_DOWN_LOG_REGTIME" ON "CEO"."A_EXCEL_DOWN_LOG" ("REGTIME");
