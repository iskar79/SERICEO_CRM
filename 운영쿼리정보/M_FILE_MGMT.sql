-- =====================================================================
-- 20261109 khma : SERICEO CRM 표준 통합 파일 관리 테이블 생성 풀스크립트
-- 스키마   : CRM
-- 테이블명 : "CRM"."M_FILE_MGMT"
-- 시퀀스   : "CRM"."M_FILE_MGMT_SEQ"
-- 트리거   : "CRM"."M_FILE_MGMT_TRG" (CRM.M_COMM_CODE_TRG 동일 표준 규격)
-- 용도     : 일반 첨부파일, 메일 발송 첨부, 드래그앤드롭 파일 통합 관리
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. 시퀀스 생성 (PK 채번용: CRM.M_FILE_MGMT_SEQ)
-- ---------------------------------------------------------------------
CREATE SEQUENCE "CRM"."M_FILE_MGMT_SEQ"
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

-- ---------------------------------------------------------------------
-- 2. 테이블 생성 ("CRM"."M_FILE_MGMT")
-- 20261109 khma :
--   - M_USITE_NO : SERICEO CRM 사이트 기본값 DEFAULT 44 적용
--   - REG_USER / UPD_USER : M_USER.M_USER_NO(UID 숫자 키, 예: 1000305)가 저장되므로 NUMBER(10) 적용
--   - REG_DATE / UPD_DATE : 최초 INSERT 시에도 함께 기록되도록 DEFAULT SYSDATE NOT NULL 적용
-- ---------------------------------------------------------------------
CREATE TABLE "CRM"."M_FILE_MGMT" (
    "M_FILE_MGMT_NO"   NUMBER(18)        NOT NULL,                      -- 파일 관리 식별 번호 (PK, M_FILE_MGMT_TRG 자동 채번)
    "M_USITE_NO"       NUMBER(10)        DEFAULT 44 NOT NULL,           -- 사이트 식별 번호 (SERICEO CRM 기본값: 44)
    "FILE_PATH"        VARCHAR2(500)     NOT NULL,                      -- 서버 물리 저장 상대 경로 (예: /FileData/2026/11/)
    "FILE_NAME"        VARCHAR2(500)     NOT NULL,                      -- 사용자 업로드 원본 파일명
    "FILE_SIZE"        NUMBER(18)        DEFAULT 0 NOT NULL,            -- 파일 바이트 용량
    "FILE_EXT"         VARCHAR2(20),                                    -- 파일 확장자 (예: pdf, jpg, xlsx)
    "JOB_TYPE"         VARCHAR2(50),                                    -- 업무 분류 코드 (EMAIL, BIZ_DOC, CONTRACT_ATTACH 등)
    "JOB_KEY"          NUMBER(18),                                      -- 연계 부모 업무 테이블 숫자 PK (SIGNSEQ, USEQ 등)
    "FILE_SEARCH_KEY"  VARCHAR2(100),                                   -- 화면 폼 연계 1:N 임시/식별 검색키
    "USE_FLAG"         VARCHAR2(1)       DEFAULT '1' NOT NULL,          -- 사용 여부 플래그 ('1': 정상 사용, '0': 삭제)
    "REG_DATE"         DATE              DEFAULT SYSDATE NOT NULL,      -- 최초 등록 일시
    "REG_USER"         NUMBER(10)        NOT NULL,                      -- 최초 등록자 고유키 (M_USER.M_USER_NO / UID)
    "UPD_DATE"         DATE              DEFAULT SYSDATE NOT NULL,      -- 최종 수정 일시 (최초 INSERT 시에도 SYSDATE 필수 기록)
    "UPD_USER"         NUMBER(10)        NOT NULL,                      -- 최종 수정자 고유키 (M_USER.M_USER_NO / UID)
    "DEL_DATE"         DATE,                                            -- 소프트 삭제 일시 (휴지통 보존용)
    CONSTRAINT "PK_M_FILE_MGMT" PRIMARY KEY ("M_FILE_MGMT_NO")
);

-- ---------------------------------------------------------------------
-- 3. PK 자동 채번 트리거 생성 ("CRM"."M_FILE_MGMT_TRG")
-- 20261109 khma : CRM.M_COMM_CODE_TRG 표준과 100% 동일한 시퀀스 동기화 및 자동 증가 트리거
-- ---------------------------------------------------------------------
CREATE OR REPLACE EDITIONABLE TRIGGER "CRM"."M_FILE_MGMT_TRG"
BEFORE INSERT ON CRM.M_FILE_MGMT FOR EACH ROW
DECLARE 
    v_newVal NUMBER := 0;
    v_incVal NUMBER := 0;
BEGIN 
    IF INSERTING AND :new.M_FILE_MGMT_NO IS NULL THEN
        SELECT CRM.M_FILE_MGMT_SEQ.NEXTVAL INTO v_newVal FROM DUAL;
        IF v_newVal = 1 THEN
            SELECT NVL(MAX(M_FILE_MGMT_NO), 0) INTO v_newVal FROM CRM.M_FILE_MGMT;
            v_newVal := v_newVal + 1;
            LOOP
                EXIT WHEN v_incVal >= v_newVal;
                SELECT CRM.M_FILE_MGMT_SEQ.NEXTVAL INTO v_incVal FROM DUAL;
            END LOOP;
        END IF;
        :new.M_FILE_MGMT_NO := v_newVal;
    END IF;
END;
/
ALTER TRIGGER "CRM"."M_FILE_MGMT_TRG" ENABLE;

-- ---------------------------------------------------------------------
-- 4. 테이블 및 컬럼 코멘트 등록
-- ---------------------------------------------------------------------
COMMENT ON TABLE  "CRM"."M_FILE_MGMT"                   IS '모나크 표준 공통 파일 관리 테이블';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."M_FILE_MGMT_NO"  IS '파일 관리 번호 (PK, M_FILE_MGMT_TRG 자동 채번)';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."M_USITE_NO"      IS '사이트/회원사 번호 (기본값: 44)';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."FILE_PATH"       IS '서버 물리 저장 상대 경로';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."FILE_NAME"       IS '업로드 원본 파일명';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."FILE_SIZE"       IS '파일 바이트 용량';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."FILE_EXT"        IS '파일 확장자';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."JOB_TYPE"        IS '업무 구분 코드';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."JOB_KEY"         IS '부모 업무 레코드 PK';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."FILE_SEARCH_KEY" IS '화면 연계 파일 검색키';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."USE_FLAG"        IS '사용 여부 (1: 사용, 0: 삭제)';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."REG_DATE"        IS '최초 등록 일시';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."REG_USER"        IS '최초 등록자 고유키 (M_USER_NO)';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."UPD_DATE"        IS '최종 수정 일시 (최초 등록 시 SYSDATE 동일 기록)';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."UPD_USER"        IS '최종 수정자 고유키 (M_USER_NO)';
COMMENT ON COLUMN "CRM"."M_FILE_MGMT"."DEL_DATE"        IS '삭제 일시';

-- ---------------------------------------------------------------------
-- 5. 성능 최적화 인덱스 생성
-- ---------------------------------------------------------------------
-- ① 화면 폼 검색 및 메일 첨부 목록 조회 최적화 (FILE_SEARCH_KEY + USE_FLAG)
CREATE INDEX "CRM"."IDX_M_FILE_MGMT_SKEY" ON "CRM"."M_FILE_MGMT" ("FILE_SEARCH_KEY", "USE_FLAG");

-- ② 업무별 부모 키 연계 조회 최적화 (JOB_TYPE + JOB_KEY)
CREATE INDEX "CRM"."IDX_M_FILE_MGMT_JOB" ON "CRM"."M_FILE_MGMT" ("JOB_TYPE", "JOB_KEY");

-- ③ 기간별 등록/관리 감사 조회 최적화 (REG_DATE)
CREATE INDEX "CRM"."IDX_M_FILE_MGMT_DATE" ON "CRM"."M_FILE_MGMT" ("REG_DATE");

-- =====================================================================
-- 6. 모나크 표준 INSERT / UPDATE / SELECT 쿼리 규격 (참고용)
-- =====================================================================
/*
-- [1] 파일 최초 등록 (MON_COMMON / FILE_MANAGER_CREATE)
--     M_FILE_MGMT_TRG 트리거가 동작하므로 M_FILE_MGMT_NO 없이 INSERT 해도 시퀀스로 자동 채번됩니다.
INSERT INTO CRM.M_FILE_MGMT (
    M_USITE_NO,
    FILE_PATH,
    FILE_NAME,
    FILE_SIZE,
    JOB_TYPE,
    FILE_SEARCH_KEY,
    USE_FLAG,
    REG_DATE,
    REG_USER,
    UPD_DATE,
    UPD_USER
) VALUES (
    NVL(TO_NUMBER(@USITE@), 44),
    @FILE_PATH@,
    @FILE_NAME@,
    NVL(TO_NUMBER(@FILE_SIZE@), 0),
    @JOB_TYPE@,
    @FILE_SEARCH_KEY@,
    NVL(@USE_FLAG@, '1'),
    SYSDATE,
    TO_NUMBER(@UID@),
    SYSDATE,
    TO_NUMBER(@UID@)
)

-- [2] 멀티파일 목록 조회 (MON_COMMON / MULTIFILE_LIST - EXEC_TYPE: LIST)
--     multiFileNew 및 GetMultiFileList에서 공통 호출하는 쿼리입니다.
SELECT
    M_FILE_MGMT_NO,
    M_USITE_NO,
    FILE_PATH,
    FILE_NAME,
    FILE_SIZE,
    FILE_EXT,
    JOB_TYPE,
    JOB_KEY,
    FILE_SEARCH_KEY,
    USE_FLAG,
    TO_CHAR(REG_DATE, 'YYYY-MM-DD HH24:MI:SS') AS REG_DATE,
    REG_USER,
    TO_CHAR(UPD_DATE, 'YYYY-MM-DD HH24:MI:SS') AS UPD_DATE,
    UPD_USER
FROM CRM.M_FILE_MGMT
WHERE FILE_SEARCH_KEY = @FILE_SEARCH_KEY@
  AND USE_FLAG = '1'
ORDER BY M_FILE_MGMT_NO DESC
*/
