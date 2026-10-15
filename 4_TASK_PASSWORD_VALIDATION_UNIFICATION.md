# SERICEO CRM 비밀번호 복잡도 및 변경 검증 로직 단일 통합 가이드 (Task 4)

> **상태: ⏸️ 고객사 승인 대기 (승인 지시 접수 후 작업 수행 예정)**  
> **대상 파일: `WebContent/js/jquery.kdb.MonArch800.js`**

---

## 1. 배경 및 작업 목적

* **현재 상태**:
  * 암호 복잡도 검증(최소 8자리, 특수문자/숫자 조합, 연속 문자 제한 등)은 `MonArch800.js`의 `validatePassword`에서 처리 중.
  * 이전 암호 재사용 방지나 새 암호/확인 암호 일치 여부 검증은 각 업무 화면 구조체의 `beforeSaveCallBack`에 개별 분산되어 있어 유지보수 및 일관성 관리가 비효율적임.
* **개선 목표**:
  * `validatePassword` 단 하나의 공통 함수로 완전 통합하여 화면별 중복 검증 로직을 제거하고 단일 진입점(Single Entry Point) 제공.
  * 기존 개별 호출부(단일 비밀번호 전달)와의 하위 호환성을 100% 유지하면서 폼 객체 또는 3개 인자 전달 시 일괄 검증을 지원하도록 다형성(Polymorphism) 구현.

---

## 2. 통합 검증 함수 지원 인터페이스

1. **폼 객체 전달 시 (`validatePassword(obj)`)**:
   * 폼 내의 `USER_PASSWORD`(현재 암호), `NEW_USER_PASSWORD`(새 암호), `NEW_USER_PASSWORD_CONFIRM`(확인 암호) 필드를 자동 추출하여 일괄 검증.
2. **문자열 3개 전달 시 (`validatePassword(newPass, confirmPass, currPass)`)**:
   * 새 암호, 확인 암호, 현재 암호를 인자로 받아 일치 여부 및 이전 암호 재사용 금지, 복잡도 일괄 검증.
3. **단일 문자열 전달 시 (`validatePassword(pw, options)`)**:
   * 기존 하위 호환성 유지. 순수 암호 복잡도 규칙(8자리 이상, 조합, 연속문자 등)만 검증.
4. **하위 호환성 Alias**:
   * `var validatePasswordSuite = validatePassword;` 지원.

---

## 3. 수정 대상 파일 및 위치

* **파일 경로**: `WebContent/js/jquery.kdb.MonArch800.js`
* **기존 코드 위치**: 약 4,347라인 ~ 4,462라인 (`function validatePassword(pw, options)` 블록)

---

## 4. 코드 적용 가이드 (고객사 승인 후 작업 시 필수 준수)

> **규칙 준수 (필수)**:
> 1. 기존 코드는 절대 삭제하지 않고 전체 블록을 `/* ... */`로 주석 보존합니다.
> 2. `[날짜] khma` 순서로 주석을 배치합니다. (AI 흔적 표현 절대 금지)

### [적용 소스 코드]

```javascript
// [적용일자] khma : 비밀번호 복잡도 및 변경 검증 로직 단일 함수 통합 (폼/다중인자/단일복잡도 다형성 지원)
/*
function validatePassword(pw, options)
{
	debugger;
	var result = true;

	var o = {
				lower: 0,
				upper: 0,
				alpha: 0,
				numeric: 0,
				special: 0,
				length: [8, Infinity],
				custom: [],
				badWords: [],
				badSequenceLength: 0,
				noQwertySequences: true,
				noSequential: true
			};
			
	for (var property in options)
	{
		o[property] = options[property];
	}
	
	var	re = {
				lower:   /[a-z]/g,
				upper:   /[A-Z]/g,
				alpha:   /[A-Z]/gi,
				numeric: /[0-9]/g,
				special: /[\W_]/g
			 };
			 
	var rule, i;

	// 암호길이검사
	if (pw.length < o.length[0] || pw.length > o.length[1])
		result = false;//return false;
	// 문자/숫자/특수문자 조합 검사
	if(!pw.match(/([a-zA-Z0-9].*[!,@,#,$,%,^,&,*,?,_,~])|([!,@,#,$,%,^,&,*,?,_,~].*[a-zA-Z0-9])/)){
		result = false;
	}
	
	// 금지어인지 검사
	for (i = 0; i < o.badWords.length; i++) 
		if (pw.toLowerCase().indexOf(o.badWords[i].toLowerCase()) > -1)
			result = false;//return false;
	

	// 암호의 연속성 여부 검사
	var SamePass_0 = 0; //동일문자 카운트
	var SamePass_1 = 0; //연속성(+) 카운드
	var SamePass_2 = 0; //연속성(-) 카운드
	 
	var chr_pass_0;
	var chr_pass_1;
	 
	for(var i=0; i < pw.length; i++) 
	{
		chr_pass_0 = pw.charAt(i);
		chr_pass_1 = pw.charAt(i+1);
	
		//동일문자 카운트
		if(chr_pass_0 == chr_pass_1) 
		{
			SamePass_0 = SamePass_0 + 1
		}
	}
	if(SamePass_0 > 2) 
	{
		result = false;
	}
	
	if (o.badSequenceLength) {
		var	lower   = "abcdefghijklmnopqrstuvwxyz",
			upper   = lower.toUpperCase(),
			numbers = "0123456789",
			qwerty  = "qwertyuiopasdfghjklzxcvbnm",
			start   = o.badSequenceLength - 1,
			seq     = "_" + pw.slice(0, start);
		for (i = start; i < pw.length; i++) {
			seq = seq.slice(1) + pw.charAt(i);
			if (
				lower.indexOf(seq)   > -1 ||
				upper.indexOf(seq)   > -1 ||
				numbers.indexOf(seq) > -1 ||
				(o.noQwertySequences && qwerty.indexOf(seq) > -1)
			) {
				result = false;//return false;
			}
		}
	}
	
	if(pw.search(re.alpha) < 0 
		//khma 대소문자구분에서 영문존재만 체크 하도록 수정
		//|| pw.search(re.lower) < 0 
		//|| pw.search(re.upper) < 0 
		|| (pw.search(re.lower) < 0
		&& pw.search(re.upper) < 0) 
		
		|| pw.search(re.special) < 0 
		|| pw.search(re.numeric) < 0)
	{
		result = false;//return false;
	}
	
	if (!result)
	{
		alert("입력한 암호를 확인해 주십시오.\n\n" + 
		      "-----------------------------------------\n\n" + 
		      "1) 암호는 최소 8글자 이상이여야 합니다.\n\n" +
		      "2) 3회이상 연속된 숫자나 알파벳을 입력할 수 없습니다.\n\n" +
		      "3) 암호는 최소 숫자/소문자/대문자/특수문자를 각각 하나씩 포함해야 합니다."); 
	}

	return (result);				
}
*/
/**
 * 비밀번호 검증 통합 함수 (단일 복잡도 검증 및 폼 전체 통합 검증 동시 지원)
 * 1) 폼 객체 전달 시: validatePassword(obj) -> 현재암호/새암호/확인암호/재사용방지/복잡도 일괄 검증
 * 2) 문자열 3개 전달 시: validatePassword(newPass, confirmPass, currPass) -> 일괄 검증
 * 3) 단일 문자열 전달 시: validatePassword(pw, options) -> 순수 복잡도 규칙만 검증
 */
function validatePassword(param1, param2, param3) {
	// [A] 폼 객체(obj)가 전달되었거나 3개의 암호 문자열이 전달된 경우 -> 전체 통합 검증 수행
	var isFormMode = (param1 && typeof param1 === "object");
	var isTripleMode = (typeof param1 === "string" && typeof param2 === "string" && arguments.length >= 2);

	if (isFormMode || isTripleMode) {
		var curr = "";
		var newP = "";
		var conf = "";

		if (isFormMode) {
			var $form = $(param1);
			function extractVal(fldName) {
				var val = $(".fieldContaner[field='" + fldName + "'] input", $form).val();
				if (!val) val = $(".fieldContaner[field='" + fldName + "']", $form).val();
				if (!val) val = $form.find("[name='" + fldName + "']").val();
				if (!val) val = $form.find("[field='" + fldName + "']").val();
				return val ? $.trim(val) : "";
			}
			curr = extractVal("USER_PASSWORD");
			newP = extractVal("NEW_USER_PASSWORD");
			conf = extractVal("NEW_USER_PASSWORD_CONFIRM");
		} else {
			newP = param1 ? $.trim(param1) : "";
			conf = param2 ? $.trim(param2) : "";
			curr = param3 ? $.trim(param3) : "";
		}

		// 1. 암호 변경을 시도하지 않는 경우 (모두 공백이면 정상 통과)
		if (!curr && !newP && !conf) {
			return true;
		}

		// 2. 현재 암호 누락 체크
		if (newP && !curr) {
			alert("비밀번호를 변경하려면 현재 암호를 입력해 주십시오.");
			return false;
		}

		// 3. 새 암호 누락 체크
		if (curr && !newP) {
			alert("새로운 암호를 입력해 주십시오.");
			return false;
		}

		// 4. 새 암호와 확인 암호 일치 검사
		if (newP !== conf) {
			alert("입력한 새 암호와 암호 확인이 일치하지 않습니다.");
			return false;
		}

		// 5. 이전 암호 재사용 금지 검사
		if (curr === newP) {
			alert("이전 암호와 동일한 암호는 재사용할 수 없습니다.");
			return false;
		}

		// 6. 새 암호 복잡도 검사 (자기 자신을 단일 문자열 모드로 재귀 호출)
		return validatePassword(newP);
	}

	// [B] 단일 문자열(pw) 전달 시 -> 순수 암호 복잡도 규칙 검증
	var pw = param1 || "";
	var options = param2 || {};
	var result = true;

	var o = {
		lower: 0,
		upper: 0,
		alpha: 0,
		numeric: 0,
		special: 0,
		length: [7, Infinity],
		custom: [],
		badWords: [],
		badSequenceLength: 0,
		noQwertySequences: true,
		noSequential: true
	};

	for (var property in options) {
		o[property] = options[property];
	}

	// 암호길이검사 (최소 8자리)
	if (pw.length < o.length[0] || pw.length > o.length[1]) {
		result = false;
	}

	// 문자/숫자/특수문자 조합 검사
	if (!pw.match(/([a-zA-Z0-9].*[!,@,#,$,%,^,&,*,?,_,~])|([!,@,#,$,%,^,&,*,?,_,~].*[a-zA-Z0-9])/)) {
		result = false;
	}

	// 금지어인지 검사
	for (var i = 0; i < o.badWords.length; i++) {
		if (pw.toLowerCase().indexOf(o.badWords[i].toLowerCase()) > -1) {
			result = false;
		}
	}

	// 암호의 동일문자 연속성 여부 검사
	var SamePass_0 = 0;
	var chr_pass_0, chr_pass_1;
	for (var i = 0; i < pw.length; i++) {
		chr_pass_0 = pw.charAt(i);
		chr_pass_1 = pw.charAt(i + 1);
		if (chr_pass_0 == chr_pass_1) {
			SamePass_0 = SamePass_0 + 1;
		}
	}
	if (SamePass_0 > 2) {
		result = false;
	}

	// 연속 키보드 배열 검사
	if (o.badSequenceLength) {
		var lower = "abcdefghijklmnopqrstuvwxyz",
			upper = lower.toUpperCase(),
			numbers = "0123456789",
			qwerty = "qwertyuiopasdfghjklzxcvbnm",
			start = o.badSequenceLength - 1,
			seq = "_" + pw.slice(0, start);
		for (var i = start; i < pw.length; i++) {
			seq = seq.slice(1) + pw.charAt(i);
			if (
				lower.indexOf(seq) > -1 ||
				upper.indexOf(seq) > -1 ||
				numbers.indexOf(seq) > -1 ||
				(o.noQwertySequences && qwerty.indexOf(seq) > -1)
			) {
				result = false;
			}
		}
	}

	if (!result) {
		alert("입력한 암호를 확인해 주십시오.\n\n" +
			  "-----------------------------------------\n\n" +
			  "1) 암호는 최소 8글자 이상이여야 합니다.\n\n" +
			  "2) 4회이상연속된 숫자나 알파벳을 입력할 수 없습니다.");
	}

	return result;
}

// 하위 호환성을 위한 alias
var validatePasswordSuite = validatePassword;
```

---

## 5. VDI 반영 대상 파일 (작업 완료 후)

* `[ ] WebContent/js/jquery.kdb.MonArch800.js`
