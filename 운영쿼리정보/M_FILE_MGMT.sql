-- =====================================================================
-- 20261109 khma : SERICEO CRM / Mon_LinkCRM 표준 통합 파일 관리 테이블 생성 스크립트
-- 테이블명 : M_FILE_MGMT
-- 시퀀스   : M_FILE_MGMT_NO_SEQ
-- 용도     : 일반 첨부파일, 메일 발송 첨부, 드래그앤드롭 파일 관리
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

-- (선택) 레거시 명명 호환용 시퀀스 동의어 또는 보조 시퀀스
-- CREATE SEQUENCE SEQ_M_FILE_MGMT START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- ---------------------------------------------------------------------
-- 2. 테이블 생성 (M_FILE_MGMT)
-- ---------------------------------------------------------------------
CREATE TABLE M_FILE_MGMT (
    M_FILE_MGMT_NO   NUMBER(18)        NOT NULL,                      -- 파일 관리 식별 번호 (PK, M_FILE_MGMT_NO_SEQ.NEXTVAL)
    M_USITE_NO       NUMBER(10)        DEFAULT 1,                     -- 사이트 식별 번호 (USITE / M_USITE_NO)
    FILE_PATH        VARCHAR2(500)     NOT NULL,                      -- 서버 물리 저장 상대 경로 (예: /FileData/2026/11/)
    FILE_NAME        VARCHAR2(500)     NOT NULL,                      -- 사용자 업로드 원본 파일명
    FILE_SIZE        NUMBER(18)        DEFAULT 0,                     -- 파일 바이트 용량
    FILE_EXT         VARCHAR2(20),                                    -- 파일 확장자 (예: pdf, jpg, xlsx)
    JOB_TYPE         VARCHAR2(50),                                    -- 업무 분류 코드 (EMAIL, BIZ_DOC, CONTRACT_ATTACH 등)
    JOB_KEY          NUMBER(18),                                      -- 연계 부모 업무 테이블 숫자 PK (SIGNSEQ, USEQ 등)
    FILE_SEARCH_KEY  VARCHAR2(100),                                   -- 화면 폼 연계 1:N 임시/식별 검색키
    USE_FLAG         VARCHAR2(1)       DEFAULT '1' NOT NULL,          -- 사용 여부 플래그 ('1': 정상 사용, '0': 삭제)
    REG_DATE         DATE              DEFAULT SYSDATE NOT NULL,      -- 최초 등록 일시
    REG_USER         VARCHAR2(50),                                    -- 최초 등록자 ID (UID)
    UPD_DATE         DATE              DEFAULT SYSDATE,               -- 최종 수정 일시
    UPD_USER         VARCHAR2(50),                                    -- 최종 수정자 ID
    DEL_DATE         DATE,                                            -- 소프트 삭제 일시 (휴지통 보존용)
    CONSTRAINT PK_M_FILE_MGMT PRIMARY KEY (M_FILE_MGMT_NO)
);

-- ---------------------------------------------------------------------
-- 3. 테이블 및 컬럼 코멘트 등록
-- ---------------------------------------------------------------------
COMMENT ON TABLE  M_FILE_MGMT                 IS '모나크 표준 공통 파일 관리 테이블';
COMMENT ON COLUMN M_FILE_MGMT.M_FILE_MGMT_NO  IS '파일 관리 번호 (PK)';
COMMENT ON COLUMN M_FILE_MGMT.M_USITE_NO      IS '사이트/회원사 번호 (USITE)';
COMMENT ON COLUMN M_FILE_MGMT.FILE_PATH       IS '서버 물리 저장 상대 경로';
COMMENT ON COLUMN M_FILE_MGMT.FILE_NAME       IS '업로드 원본 파일명';
COMMENT ON COLUMN M_FILE_MGMT.FILE_SIZE       IS '파일 바이트 용량';
COMMENT ON COLUMN M_FILE_MGMT.FILE_EXT        IS '파일 확장자';
COMMENT ON COLUMN M_FILE_MGMT.JOB_TYPE        IS '업무 구분 코드';
COMMENT ON COLUMN M_FILE_MGMT.JOB_KEY         IS '부모 업무 레코드 PK';
COMMENT ON COLUMN M_FILE_MGMT.FILE_SEARCH_KEY IS '화면 연계 파일 검색키';
COMMENT ON COLUMN M_FILE_MGMT.USE_FLAG        IS '사용 여부 (1: 사용, 0: 삭제)';
COMMENT ON COLUMN M_FILE_MGMT.REG_DATE        IS '등록 일시';
COMMENT ON COLUMN M_FILE_MGMT.REG_USER        IS '등록자 ID';
COMMENT ON COLUMN M_FILE_MGMT.UPD_DATE        IS '수정 일시';
COMMENT ON COLUMN M_FILE_MGMT.UPD_USER        IS '수정자 ID';
COMMENT ON COLUMN M_FILE_MGMT.DEL_DATE        IS '삭제 일시';

-- ---------------------------------------------------------------------
-- 4. 성능 최적화 인덱스 생성
-- ---------------------------------------------------------------------
-- 폼 검색 및 메일 첨부 목록 조회 최적화 (FILE_SEARCH_KEY + USE_FLAG)
CREATE INDEX IDX_M_FILE_MGMT_SKEY ON M_FILE_MGMT (FILE_SEARCH_KEY, USE_FLAG);

-- 업무별 부모 키 연계 조회 최적화 (JOB_TYPE + JOB_KEY)
CREATE INDEX IDX_M_FILE_MGMT_JOB ON M_FILE_MGMT (JOB_TYPE, JOB_KEY);

-- 기간별 등록/관리 감사 조회 최적화 (REG_DATE)
CREATE INDEX IDX_M_FILE_MGMT_DATE ON M_FILE_MGMT (REG_DATE);
