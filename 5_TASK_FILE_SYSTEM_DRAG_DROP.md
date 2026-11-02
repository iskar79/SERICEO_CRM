# 5. 차세대 드래그앤드롭 파일 시스템 (`singleFileNew` / `multiFileNew`) 설계 및 구축 명세서

> **문서 개요**: 본 문서는 SERICEO CRM(MonArch 8.2.0) 환경에서 기존 구형 파일 업로드 방식(`file`, `multifile`)의 한계를 극복하고, **HTML5 Drag & Drop 기반의 직관적인 UI/UX**와 **완벽한 데이터 무결성 및 고아(더미) 파일 방지 아키텍처**를 적용하기 위한 종합 기술 명세서입니다.

---

## 🚨 최우선 불변 원칙: 기존 파일 시스템 100% 원형 보존 및 하위 호환성 보장

> [!IMPORTANT]
> **기존 운영 기능 무중단 / 무영향 원칙 (Zero Impact)**
> 1. **기존 컴포넌트 절대 불변**: 현재 운영 중인 기존 `file`, `singleFile`, `multifile`, `signfile` 관련 프론트엔드(`superContaner.js`, `jobButton.js`) 및 백엔드(`UploadController.java`, `CommonExcelUtil.java` 등) 로직은 **단 한 줄도 수정하거나 기능을 축소하지 않고 100% 동일하게 유지**합니다.
> 2. **신규 타입 완전 분리**: 신규 드래그앤드롭 및 무결성 보장 기능은 오직 **신규 타입 명칭인 `singleFileNew` 및 `multiFileNew`**로 완벽히 격리된 신규 분기(`case "singlefilenew":`, `case "multifilenew":`)와 신규 엔드포인트(`/uploadFileNew.mon` 등)에서만 독립적으로 구동됩니다.
> 3. **기존 화면에 영향 제로**: 기존 메타데이터나 기존 화면에서 `singleFile`이나 `multifile`을 사용 중인 모든 프로그램은 기존 방식 그대로 정상 동작함을 철저히 보장합니다.

---

## 1. 추진 배경 및 기존 파일 시스템의 3대 핵심 문제점

현재 운영 중인 CRM의 파일 처리 방식(`UploadController.java`, `superContaner.js`)을 정밀 전수 분석한 결과, 다음과 같은 심각한 아키텍처 결함이 확인되었습니다.

```
[기존 파일 업로드/교체 시의 치명적 결함 구조]
1. 프론트엔드:
   - 파일 선택 즉시 타임스탬프 기반 임의 키 발급 (fileSearchKey = "admin20261102133000")
   - 즉시 서버로 /fileupload.mon 비동기 전송
2. 백엔드 (UploadController):
   - 서버 물리 디스크(/FileData/YYYY/MM/)에 무조건 파일 생성
   - M_FILE_MGMT 테이블에 레코드 INSERT
3. 문제 발생:
   - [취소]를 누르고 나가도 파일은 디스크에 영구 쓰레기로 방치됨
   - 다른 파일로 교체 시, 기존 파일은 디스크에서 삭제되지 않고 외래키 링크만 끊어짐 (고아 파일 누적)
   - 만약 파일 교체 시 기존 파일을 즉시 지우면, 저장을 취소했을 때 원본 파일이 영구 유실됨
```

1. **사용자 경험(UI/UX)의 노후화**:
   - 파일을 첨부할 때마다 별도의 팝업창(`$.GetFileManager`)을 띄워 `<input type="file">`을 탐색기로 찾아야 하는 구형 방식.
   - 드래그앤드롭(Drag & Drop) 및 다중 파일 일괄 첨부, 파일 미리보기 기능 부재.
2. **외래키 링크 단절 및 디스크 고아 파일(Garbage / Orphan Files) 누적**:
   - 단일 파일(`singleFile`) 교체 시 비즈니스 테이블의 컬럼 값만 새 키로 덮어써지고, 기존 파일은 `M_FILE_MGMT` 및 실제 디스크에서 전혀 삭제되지 않아 수십~수백 GB의 더미 파일이 누적됨.
3. **트랜잭션 분리 미비로 인한 데이터 유실(Data Loss) 위험**:
   - 파일을 교체하는 시점에 기존 파일을 즉시 삭제해 버릴 경우, 사용자가 [취소]를 누르거나 화면 저장 중 유효성 검사 에러/DB 에러 발생 시 원본 파일이 영원히 사라지는 치명적 문제.

---

## 2. 6대 잠재 구멍(Edge Cases & Security Holes) 및 방어 전략

본 설계에서는 실무 운영에서 발생할 수 있는 6가지 예외 상황을 원천 차단합니다.

| 번호 | 잠재적 구멍 (Holes) | 발생 위험 시나리오 | 본 설계의 방어 전략 |
| :---: | :--- | :--- | :--- |
| **H-1** | **저장 취소 시 원본 파일 유실** | 새 파일 드롭 즉시 기존 파일을 지웠는데, 사용자가 화면 [취소]를 누름 | **지연 업로드 (Deferred Upload)**: 최종 [저장] 버튼이 눌려 DB Commit이 확정되기 전까지 기존 원본 파일 보존 |
| **H-2** | **복사 등록(`CopyNew`) 시 파일 공유 참사** | 10번 계약을 복사해 11번 신규 계약을 생성했으나, 두 계약이 동일 물리 파일을 공유 ➡️ 한쪽 삭제 시 동반 파괴 | `CopyNew` 시 기존 파일 키를 공유하지 않고, 물리 파일도 새 이름으로 복사 분리(`File.copy`)하여 독립화 |
| **H-3** | **감사/분쟁 시 과거 이력 추적 불가** | 기존 파일을 `file.delete()`로 즉시 파쇄하여 분쟁 발생 시 원본 증명 불가 | **휴지통(Soft Delete / Trash)** 디렉토리(`/FileData/trash/`) 이동 및 DB `DEL_DATE` 기록 후 90일 보존 |
| **H-4** | **비즈니스 저장 실패 시 트랜잭션 불일치** | 파일은 교체/삭제되었으나 고객/계약 테이블 INSERT/UPDATE 쿼리 실패 | Java 백엔드 서비스에서 DB 트랜잭션 정상 커밋 확인 후에만 파일 확정/삭제 실행 |
| **H-5** | **Path Traversal 및 웹쉘 악성 파일** | 파일명에 `../../` 조작으로 시스템 파일 삭제 또는 `.jsp` 실행 파일 업로드 | `M_IMAGE_GAL`의 PK(`M_IMAGE_GAL_NO`) 기반 경로 조회 + 화이트리스트 확장자 검증 + 물리 루트 검증 |
| **H-6** | **다운로드 중 파일 락(Lock) 충돌** | 사용자가 파일을 열람/다운로드 중인 상태에서 타인이 해당 파일 삭제/덮어쓰기 | 덮어쓰기 원천 금지, 파일명 고유 타임스탬프 원칙 유지 + 다운로드 스트림 완벽 try-with-resources |

---

## 3. 화면 할당 `fileSearchKey` 및 DB 매핑 생명주기(Lifecycle) 설계

SERICEO CRM 실제 운영 DB 스키마(`M_IMAGE_GAL`) 분석 결과:
* **`UPPER_KEY` (`NUMBER`)**: 부모 업무 레코드의 실제 숫자 PK (`SIGNSEQ`, `USEQ`, `CSEQ` 등)
* **`UPPER_INFO` (`NVARCHAR2(50 CHAR)`)**: 프론트엔드 화면에서 폼과 파일을 1:N으로 연결하기 위해 동적 할당되는 `fileSearchKey`

따라서 화면에 할당되는 `fileSearchKey`는 다음 4대 시나리오에 맞추어 엄격하게 통제됩니다:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   화면 할당 fileSearchKey 의 4대 생명주기(Lifecycle) 규칙               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. [신규 등록 시 (mode='new')]                                                         │
│    - 아직 부모 PK(UPPER_KEY)가 없으므로 _M.UserInfo.id + "_" + Date.now() 발급 (25자 이내)│
│    - 드롭된 파일은 M_IMAGE_GAL.UPPER_INFO 에 매핑되어 임시 대기                             │
│    - 폼 최종 저장 시 오라클 시퀀스 번호가 발급되면 UPPER_KEY(NUMBER) 로 동기화 완료           │
│                                                                                        │
│ 2. [기존 데이터 열람/수정 시 (mode='modify')]                                          │
│    - 비즈니스 테이블 컬럼에 저장되어 있던 기존 키(또는 SIGNSEQ)를 fileSearchKey 로 바인딩  │
│    - 파일 교체 시에도 지연 업로드를 거치며, 최종 [저장] 시에만 기존 파일이 안전하게 교체됨     │
│                                                                                        │
│ 3. [복사 등록 시 (CopyNew)]                                                            │
│    - ★ 절대 기존 fileSearchKey 를 그대로 상속하지 않고, 신규 고유 키를 즉시 재발급!          │
│    - 기존 첨부파일이 존재하는 경우에만 물리 파일을 복제(File.copy)하여 원본 계약과 완전 격리  │
│    - 기존 파일이 없으면 물리 복제 생략 (Null-Safe)                                      │
│                                                                                        │
│ 4. [저장 취소/창 닫기 시]                                                              │
│    - 지연 업로드 원칙에 따라 브라우저 메모리에만 존재하므로, DB/디스크에 더미 데이터 발생 0% │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 신규 필드 규격: `singleFileNew` vs `multiFileNew`

### 1) `singleFileNew` (단일 파일 드래그앤드롭 필드)
- **주요 용도**: 사업자등록증, 계약서 날인본, 프로필 이미지, 단일 견적서 등 1:1 매핑 파일
- **화면 UI 형태**:
  - 파일 미등록 시: 1칸 높이의 점선 드롭존 (`"이곳에 파일을 드래그하거나 클릭하여 첨부하세요."`)
  - 파일 첨부 완료 시: 파일 아이콘 + 파일명 + 용량 + `[다운로드]` + `[교체]` + `[삭제(✖)]` 버튼 노출
- **교체/삭제 라이프사이클**:
  - 새 파일을 드래그앤드롭하면 화면에는 즉시 *"새 파일로 교체 예정: 신규계약서.pdf (저장 시 반영)"* 미리보기 표시
  - 브라우저 메모리(JS `File` 객체)에만 보관하며, 사용자가 최종 [저장]을 누르기 전까지는 기존 원본 파일이 절대 삭제되지 않음!

```
┌─────────────────────────────────────────────────────────────┐
│ [singleFileNew 컴포넌트 렌더링 예시]                        │
│                                                             │
│  📄 사업자등록증_2026.pdf (1.4MB)   [다운로드] [교체] [✖]    │
│  ※ 새로운 파일을 이곳으로 끌어다 놓으면 교체됩니다.         │
└─────────────────────────────────────────────────────────────┘
```

### 2) `multiFileNew` (다중 파일 드래그앤드롭 필드)
- **주요 용도**: 공지사항 다중 첨부, 품의서 증빙 묶음, 상담 첨부 서류 등 1:N 매핑 파일
- **화면 UI 형태**:
  - 상단: 넓은 드롭존 영역 (`"여러 개의 파일을 동시에 끌어다 놓거나 클릭하세요."`)
  - 하단: 실시간 첨부 목록 그리드 (체크박스, 파일명, 파일크기, 업로드 진행률, 개별 `[✖]` 삭제)
- **교체/삭제 라이프사이클**:
  - 여러 파일을 한꺼번에 드래그앤드롭하여 목록에 추가
  - 기존 파일과 신규 추가 대기 파일이 시각적으로 구분되어 표시

```
┌─────────────────────────────────────────────────────────────┐
│ [multiFileNew 컴포넌트 렌더링 예시]                         │
│                                                             │
│       📁 마우스로 여러 파일을 이곳에 끌어다 놓으세요.       │
│       (또는 클릭하여 다중 선택, 파일당 최대 20MB)           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 첨부 파일 목록 (총 2건 / 2.1MB)                             │
│ [x] 1. 제품소개서_v2.pdf (1.8MB)             [다운로드] [✖] │
│ [ ] 2. 추가견적서.xlsx (320KB)               [다운로드] [✖] │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 백엔드 아키텍처 및 디렉토리 구조 설계

### 1) 물리 디렉토리 구조 표준
```
서버 업로드 루트 (monarch.fileupload.path)
  ├── FileData/
  │    ├── 2026/
  │    │    └── 11/
  │    │         └── 20261102133000_사업자등록증.pdf  <-- 정식 보관 파일
  │    │
  │    ├── temp/                                      <-- 업로드 대기 임시 영역
  │    │    └── temp_admin_20261102_133015.tmp        <-- 24시간 후 자동 파기
  │    │
  │    └── trash/                                     <-- 삭제된 파일 안전 보관함 (휴지통)
  │         └── 202611/
  │              └── DEL_20261102_구버전계약서.pdf    <-- 90일 후 정기 파기
```

### 2) 백엔드 컨트롤러 신규 API 설계 (`UploadController.java`)

1. **`POST /uploadFileNew.mon`** (임시 또는 정식 비동기 업로드):
   - `singleFileNew`, `multiFileNew` 공용 `MultipartFile` 수신
   - 확장자 화이트리스트 및 용량 검증
   - 임시 또는 정식 디렉토리에 물리 저장 후 파일 메타 정보 JSON 반환 (`fileId`, `fileName`, `fileSize`, `filePath`)
2. **`POST /deleteFileSafe.mon`** (안전 파일 삭제/휴지통 이동):
   - 클라이언트에서 넘긴 임의 경로가 아닌 `fileId`로 `M_FILE_MGMT` 테이블 조회
   - 정식 폴더에서 `/FileData/trash/` 폴더로 이동 (`renameTo`)
   - `M_FILE_MGMT`의 `USE_FLAG = '0'`, `DEL_DATE = SYSDATE` 갱신
3. **`POST /copyFileKey.mon`** (`CopyNew` 복사 등록 지원):
   - 복사 대상 `fileSearchKey`를 수신하여, 해당 파일들을 물리적으로 복사 생성 후 새로운 고유 `fileSearchKey` 발급 반환

---

## 5. 프론트엔드 엔진 확장 설계 (`superContaner.js`)

### 1) 구조체 정의 표준 (JSON)
화면 개발자는 구조체에서 다음과 같이 직관적으로 필드를 선언할 수 있습니다:

```javascript
// singleFileNew 정의 예시
{
    type: "field",
    label: "사업자등록증",
    fieldContaner: [{
        field: "BIZ_REG_DOC",
        type: "singleFileNew",
        jobType: "BIZ_DOC",
        extenders: ["PDF", "JPG", "PNG"],
        maxSizeMB: 10,
        required: true
    }]
}

// multiFileNew 정의 예시
{
    type: "field",
    label: "계약첨부서류",
    fieldContaner: [{
        field: "ATTACH_GROUP_KEY",
        type: "multiFileNew",
        jobType: "CONTRACT_ATTACH",
        extenders: ["PDF", "HWP", "DOCX", "XLSX", "ZIP"],
        maxSizeMB: 30,
        required: false
    }]
}
```

### 2) `superContaner.js` 내부 엔진 렌더링 로직

1. **`fieldGen` 핸들러 분기**:
   - `case "singlefilenew":`
   - `case "multifilenew":`
2. **HTML5 Drag & Drop 이벤트 바인딩**:
   ```javascript
   $dropZone.on("dragover dragenter", function(e) {
       e.preventDefault();
       e.stopPropagation();
       $(this).addClass("drag-active"); // 테두리 강조 애니메이션
   });
   $dropZone.on("dragleave dragend drop", function(e) {
       e.preventDefault();
       e.stopPropagation();
       $(this).removeClass("drag-active");
   });
   $dropZone.on("drop", function(e) {
       var files = e.originalEvent.dataTransfer.files;
       fnHandleFiles(files);
   });
   ```
3. **지연 업로드 상태 머신 제어**:
   - 기존 파일 보존 ➡️ 신규 파일 드롭 시 미리보기 전환 ➡️ [저장] 시 최종 AJAX 커밋 ➡️ [취소] 시 메모리 비우고 원본 복원

---

## 6. 단계별 개발 로드맵 (Step-by-Step)

- [ ] **Phase 1: 백엔드 안전 파일 처리 기반 구축 (`UploadController.java`)**
  - `/uploadFileNew.mon` (지연/임시 업로드 지원)
  - `/deleteFileSafe.mon` (휴지통 이동 및 DB 소프트 삭제)
  - `/copyFileKey.mon` (복사 등록 지원)
- [ ] **Phase 2: 프론트엔드 `singleFileNew` 드래그앤드롭 컴포넌트 개발 (`superContaner.js`)**
  - 점선 드롭존 UI 및 마우스 호버 CSS 스타일링
  - 파일 교체 시 미리보기 & 롤백(저장 취소 대응) 상태 관리
- [ ] **Phase 3: 프론트엔드 `multiFileNew` 다중 파일 드래그앤드롭 컴포넌트 개발 (`superContaner.js`)**
  - 다중 파일 드롭 처리 및 목록 그리드 렌더링
  - 개별 삭제 및 전체 다운로드 연동
- [ ] **Phase 4: VDI 테스트 및 6대 잠재 구멍 시나리오 검증**
  - 취소 후 재조회 시 원본 보존 여부 검증
  - `CopyNew` 복사 등록 후 한쪽 삭제 시 타 레코드 파일 독립성 검증
  - 대용량 파일 및 비인가 확장자 차단 검증
