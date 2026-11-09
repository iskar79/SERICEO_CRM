-- =====================================================================
-- 20261109 khma : SERICEO CRM / Mon_LinkCRM 표준 통합 파일 관리 테이블 생성 풀스크립트
-- 테이블명 : M_FILE_MGMT
-- 시퀀스   : M_FILE_MGMT_NO_SEQ
-- 트리거   : TRG_M_FILE_MGMT_BI (PK 미지정/NULL 인서트 시 시퀀스 자동 채번)
-- 용도     : 일반 첨부파일, 메일 발송 첨부, 드래그앤드롭 파일 통합 관리
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. 시퀀스 생성 (PK 채번용)
-- ---------------------------------------------------------------------
CREATE SEQUENCE M_FILE_MGMT_NO_SEQ
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

-- ---------------------------------------------------------------------
-- 2. 테이블 생성 (M_FILE_MGMT)
-- 20261109 khma : 최초 INSERT 시에도 UPD_DATE / UPD_USER가 함께 기록되도록 DEFAULT SYSDATE NOT NULL 적용
-- ---------------------------------------------------------------------
CREATE TABLE M_FILE_MGMT (
    M_FILE_MGMT_NO   NUMBER(18)        NOT NULL,                      -- 파일 관리 식별 번호 (PK, 트리거/시퀀스 자동 채번)
    M_USITE_NO       NUMBER(10)        DEFAULT 1 NOT NULL,            -- 사이트 식별 번호 (USITE / M_USITE_NO)
    FILE_PATH        VARCHAR2(500)     NOT NULL,                      -- 서버 물리 저장 상대 경로 (예: /FileData/2026/11/)
    FILE_NAME        VARCHAR2(500)     NOT NULL,                      -- 사용자 업로드 원본 파일명
    FILE_SIZE        NUMBER(18)        DEFAULT 0 NOT NULL,            -- 파일 바이트 용량
    FILE_EXT         VARCHAR2(20),                                    -- 파일 확장자 (예: pdf, jpg, xlsx)
    JOB_TYPE         VARCHAR2(50),                                    -- 업무 분류 코드 (EMAIL, BIZ_DOC, CONTRACT_ATTACH 등)
    JOB_KEY          NUMBER(18),                                      -- 연계 부모 업무 테이블 숫자 PK (SIGNSEQ, USEQ 등)
    FILE_SEARCH_KEY  VARCHAR2(100),                                   -- 화면 폼 연계 1:N 임시/식별 검색키
    USE_FLAG         VARCHAR2(1)       DEFAULT '1' NOT NULL,          -- 사용 여부 플래그 ('1': 정상 사용, '0': 삭제)
    REG_DATE         DATE              DEFAULT SYSDATE NOT NULL,      -- 최초 등록 일시
    REG_USER         VARCHAR2(50)      NOT NULL,                      -- 최초 등록자 ID (UID)
    UPD_DATE         DATE              DEFAULT SYSDATE NOT NULL,      -- 최종 수정 일시 (최초 INSERT 시에도 SYSDATE 필수 기록)
    UPD_USER         VARCHAR2(50)      NOT NULL,                      -- 최종 수정자 ID (최초 INSERT 시에도 등록자 UID 기록)
    DEL_DATE         DATE,                                            -- 소프트 삭제 일시 (휴지통 보존용)
    CONSTRAINT PK_M_FILE_MGMT PRIMARY KEY (M_FILE_MGMT_NO)
);

-- ---------------------------------------------------------------------
-- 3. PK 자동 채번 및 감사일시 보정 트리거 생성 (BEFORE INSERT)
-- 20261109 khma : 타 모나크 테이블 표준과 동일하게 PK(M_FILE_MGMT_NO) 미지정 시 시퀀스 자동 증가 처리
-- ---------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_M_FILE_MGMT_BI
BEFORE INSERT ON M_FILE_MGMT
FOR EACH ROW
BEGIN
    -- PK(M_FILE_MGMT_NO)가 없거나 NULL로 넘어올 때만 시퀀스로 자동 채번
    IF :NEW.M_FILE_MGMT_NO IS NULL THEN
        SELECT M_FILE_MGMT_NO_SEQ.NEXTVAL
          INTO :NEW.M_FILE_MGMT_NO
          FROM DUAL;
    END IF;

    -- 최초 등록 시 REG_DATE, UPD_DATE 방어 보정
    IF :NEW.REG_DATE IS NULL THEN
        :NEW.REG_DATE := SYSDATE;
    END IF;
    IF :NEW.UPD_DATE IS NULL THEN
        :NEW.UPD_DATE := :NEW.REG_DATE;
    END IF;

    -- 최초 등록 시 UPD_USER가 누락된 경우 REG_USER와 동일하게 보정
    IF :NEW.UPD_USER IS NULL AND :NEW.REG_USER IS NOT NULL THEN
        :NEW.UPD_USER := :NEW.REG_USER;
    END IF;
END;
/

-- ---------------------------------------------------------------------
-- 4. 테이블 및 컬럼 코멘트 등록
-- ---------------------------------------------------------------------
COMMENT ON TABLE  M_FILE_MGMT                 IS '모나크 표준 공통 파일 관리 테이블';
COMMENT ON COLUMN M_FILE_MGMT.M_FILE_MGMT_NO  IS '파일 관리 번호 (PK, 미지정 시 트리거 자동 채번)';
COMMENT ON COLUMN M_FILE_MGMT.M_USITE_NO      IS '사이트/회원사 번호 (USITE)';
COMMENT ON COLUMN M_FILE_MGMT.FILE_PATH       IS '서버 물리 저장 상대 경로';
COMMENT ON COLUMN M_FILE_MGMT.FILE_NAME       IS '업로드 원본 파일명';
COMMENT ON COLUMN M_FILE_MGMT.FILE_SIZE       IS '파일 바이트 용량';
COMMENT ON COLUMN M_FILE_MGMT.FILE_EXT        IS '파일 확장자';
COMMENT ON COLUMN M_FILE_MGMT.JOB_TYPE        IS '업무 구분 코드';
COMMENT ON COLUMN M_FILE_MGMT.JOB_KEY         IS '부모 업무 레코드 PK';
COMMENT ON COLUMN M_FILE_MGMT.FILE_SEARCH_KEY IS '화면 연계 파일 검색키';
COMMENT ON COLUMN M_FILE_MGMT.USE_FLAG        IS '사용 여부 (1: 사용, 0: 삭제)';
COMMENT ON COLUMN M_FILE_MGMT.REG_DATE        IS '최초 등록 일시';
COMMENT ON COLUMN M_FILE_MGMT.REG_USER        IS '최초 등록자 ID';
COMMENT ON COLUMN M_FILE_MGMT.UPD_DATE        IS '최종 수정 일시 (최초 등록 시 SYSDATE 동일 기록)';
COMMENT ON COLUMN M_FILE_MGMT.UPD_USER        IS '최종 수정자 ID (최초 등록 시 REG_USER 동일 기록)';
COMMENT ON COLUMN M_FILE_MGMT.DEL_DATE        IS '삭제 일시';

-- ---------------------------------------------------------------------
-- 5. 성능 최적화 인덱스 생성
-- ---------------------------------------------------------------------
-- ① 화면 폼 검색 및 메일 첨부 목록 조회 최적화 (FILE_SEARCH_KEY + USE_FLAG)
CREATE INDEX IDX_M_FILE_MGMT_SKEY ON M_FILE_MGMT (FILE_SEARCH_KEY, USE_FLAG);

-- ② 업무별 부모 키 연계 조회 최적화 (JOB_TYPE + JOB_KEY)
CREATE INDEX IDX_M_FILE_MGMT_JOB ON M_FILE_MGMT (JOB_TYPE, JOB_KEY);

-- ③ 기간별 등록/관리 감사 조회 최적화 (REG_DATE)
CREATE INDEX IDX_M_FILE_MGMT_DATE ON M_FILE_MGMT (REG_DATE);

-- =====================================================================
-- 6. 모나크 표준 INSERT / UPDATE / SELECT 쿼리 규격 (참고용)
-- =====================================================================
/*
-- [1] 파일 최초 등록 (MON_COMMON / FILE_MANAGER_CREATE)
--     트리거(TRG_M_FILE_MGMT_BI)가 걸려 있으므로 M_FILE_MGMT_NO 컬럼을 생략해도 자동 채번됩니다.
INSERT INTO M_FILE_MGMT (
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
    NVL(TO_NUMBER(@USITE@), 1),
    @FILE_PATH@,
    @FILE_NAME@,
    NVL(TO_NUMBER(@FILE_SIZE@), 0),
    @JOB_TYPE@,
    @FILE_SEARCH_KEY@,
    NVL(@USE_FLAG@, '1'),
    SYSDATE,
    @UID@,
    SYSDATE,
    @UID@
)

-- [2] 파일 목록 조회 (MON_COMMON / MULTIFILE_LIST)
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
    REG_DATE,
    REG_USER,
    UPD_DATE,
    UPD_USER
FROM M_FILE_MGMT
WHERE FILE_SEARCH_KEY = @FILE_SEARCH_KEY@
  AND USE_FLAG = '1'
ORDER BY M_FILE_MGMT_NO DESC
*/
