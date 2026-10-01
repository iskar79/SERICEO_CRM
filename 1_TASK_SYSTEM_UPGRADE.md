# Task 1: 시스템 버전 업그레이드 전략 및 가이드

본 문서는 SERICEO CRM의 구형 라이브러리(Spring, jQuery, POI)를 시스템 붕괴 없이 최소한의 공수로 안전하게 업그레이드하기 위한 전략 지침서입니다.

---

## 1. 이클립스(Eclipse) 프로젝트 임포트 및 컴파일러 에러 조치 (최우선 필수)
이클립스 환경에서 구형 프로젝트를 불러올 때 에러가 발생하여 프로젝트 자체가 열리지 않을 수 있습니다. **반드시 이 조치를 가장 먼저 수행하십시오.**

**[1-1. 프로젝트 임포트 에러 조치 (필수)]**
* VDI 내부 또는 로컬에서 이클립스(특히 2024년 이후 최신 버전) 사용 시, 구형 VJET 플러그인 찌꺼기 때문에 프로젝트를 아예 불러오지 못할 수 있습니다.
* 이를 해결하기 위해 VDI 이클립스에서 프로젝트 최상단에 있는 `.project` 파일을 열고, 아래의 **구형 찌꺼기 노드들을 찾아 통째로 삭제(텍스트 지우기)** 하십시오.

```xml
<!-- 삭제 대상 1: buildCommand 내의 외부 툴 빌더 (vjet, jsdt) -->
<buildCommand>
    <name>org.eclipse.ui.externaltools.ExternalToolBuilder</name>
    <triggers>full,incremental,</triggers>
    <arguments>
        <dictionary>
            <key>LaunchConfigHandle</key>
            <value>&lt;project&gt;/.externalToolBuilders/org.ebayopensource.vjet.eclipse.core.builder.launch</value>
        </dictionary>
    </arguments>
</buildCommand>
<buildCommand>
    <name>org.eclipse.ui.externaltools.ExternalToolBuilder</name>
    <triggers>full,incremental,</triggers>
    <arguments>
        <dictionary>
            <key>LaunchConfigHandle</key>
            <value>&lt;project&gt;/.externalToolBuilders/org.eclipse.wst.jsdt.core.javascriptValidator (1).launch</value>
        </dictionary>
    </arguments>
</buildCommand>

<!-- 삭제 대상 2: natures 내의 vjet 및 jsNature -->
<nature>org.ebayopensource.vjet.core.nature</nature>
<nature>org.eclipse.wst.jsdt.core.jsNature</nature>
```
* **주의**: 맨 윗부분의 `<name>MonArch821</name>` 도 VDI 프로젝트 폴더명과 동일하게 `<name>sericeo_crm</name>` 등으로 텍스트를 맞춰주시면 완벽하게 에러가 사라집니다.

**[1-2. 컴파일러 버전 1.6 ➡️ 11 상향 조치]**
* 이클립스 내부에서 `Compiling for Java version '1.6' is no longer supported` 에러가 발생할 경우, 반드시 프로젝트의 Java 컴파일러 버전을 Tomcat 9 런타임 스펙에 맞춰 `11` (또는 최소 `1.8`)로 올려주어야 합니다.

1. 프로젝트 우클릭 ➡️ **Properties (속성)** 클릭
2. 좌측 메뉴에서 **Java Compiler** 선택
3. `Compiler compliance level`을 **11**로 변경하고 Apply 클릭
4. 좌측 메뉴에서 **Project Facets** 선택
5. `Java` 항목의 버전을 **1.6 ➡️ 11**로 변경 후 Apply & Close 클릭

---

## 2. Java Spring Framework 4.3 업그레이드 가이드
현재 구형 `Jackson 1.x`와 `Quartz 1.8.x` 에러를 피하기 위한 유일한 목표 버전은 **4.3.30.RELEASE** 입니다.

**[작업 순서]**
1. 이 프로젝트는 Maven(pom.xml) 기반이 아니므로 수동으로 `.jar` 파일을 교체해야 합니다.
2. 기존 `WebContent/WEB-INF/lib` 폴더에 있는 `org.springframework.*-3.1.1.RELEASE.jar` 파일들(약 20개)을 모두 삭제합니다.
   * **주의**: `org.springframework.asm-3.1.1`과 `org.springframework.web.struts-3.1.1`은 Spring 4에서 아예 폐기되었으므로 삭제만 하고 새로 받지 않습니다.
3. **외부 인터넷 PC에서 아래 17개의 파일(버전: 4.3.30.RELEASE)을 다운로드**하여 망연계 시스템으로 VDI로 반입한 후 `WEB-INF/lib`에 넣습니다.
   
   > 🔗 **공식 다운로드 사이트 (Maven Central)**: [https://mvnrepository.com/](https://mvnrepository.com/) 또는 [https://repo1.maven.org/maven2/org/springframework/](https://repo1.maven.org/maven2/org/springframework/)
   > * **다운로드 방법**: 위 사이트에 접속하여 검색창에 아래 파일명을 치거나, repo1 링크를 타고 들어가 `4.3.30.RELEASE` 폴더 안의 `.jar` 파일을 직접 클릭해서 받으시면 됩니다.

   * `spring-aop-4.3.30.RELEASE.jar`
   * `spring-aspects-4.3.30.RELEASE.jar`
   * `spring-beans-4.3.30.RELEASE.jar`
   * `spring-context-4.3.30.RELEASE.jar`
   * `spring-context-support-4.3.30.RELEASE.jar`
   * `spring-core-4.3.30.RELEASE.jar`
   * `spring-expression-4.3.30.RELEASE.jar`
   * `spring-instrument-4.3.30.RELEASE.jar`
   * `spring-instrument-tomcat-4.3.30.RELEASE.jar`
   * `spring-jdbc-4.3.30.RELEASE.jar`
   * `spring-jms-4.3.30.RELEASE.jar`
   * `spring-orm-4.3.30.RELEASE.jar`
   * `spring-oxm-4.3.30.RELEASE.jar`
   * `spring-test-4.3.30.RELEASE.jar`
   * `spring-tx-4.3.30.RELEASE.jar`
   * `spring-web-4.3.30.RELEASE.jar`
   * `spring-webmvc-4.3.30.RELEASE.jar` (참고: 기존 `web.servlet`이 `webmvc`로 이름 변경됨)
   * `spring-webmvc-portlet-4.3.30.RELEASE.jar`
4. `WebContent/WEB-INF/web.xml`과 `dispatcher-servlet.xml` 파일 상단의 XML 스키마(`xmlns`) 버전을 `3.1` 에서 `4.3` 으로 변경합니다.
   ```xml
   <!-- web.xml / dispatcher-servlet.xml 스키마 헤더 수정 예시 -->
   <!-- [기존] http://www.springframework.org/schema/beans/spring-beans-3.1.xsd -->
   <!-- [수정] http://www.springframework.org/schema/beans/spring-beans-4.3.xsd -->
   ```

---

## 3. jQuery 프론트엔드 업그레이드 가이드
16,000줄짜리 화면 엔진(`superContaner.js`)이 깨지는 것을 막기 위한 유일한 목표 버전은 **1.12.4** 입니다.

**[작업 순서]**
1. jQuery 공식 홈페이지에서 `jquery-1.12.4.min.js` 파일을 다운로드합니다.
2. 다운받은 파일을 `WebContent/js/` 폴더 안에 복사해 넣습니다.
3. 기존 파일인 `jquery-1.10.2.min.js` 파일은 삭제하지 말고 이름 뒤에 `_old`를 붙여 백업해 둡니다.
4. `WebContent/ui/monform.jsp` (SPA 메인 컨테이너) 파일이나 `index.jsp` 파일을 엽니다.
5. 아래와 같이 `<script>` 태그의 버전을 변경합니다.
   ```html
   <!-- [기존 코드] -->
   <script src="/js/jquery-1.10.2.min.js"></script>
   
   <!-- [수정 코드] -->
   <script src="/js/jquery-1.12.4.min.js"></script>
   ```
6. 웹 브라우저 캐시를 완전히 삭제(Ctrl + Shift + R)한 뒤 접속하여 메인 화면 리스트가 정상적으로 그려지는지 확인합니다.

---

## 4. Apache POI 4.1.2 라이브러리 교체 가이드 (Task 2 대비 필수)

과업 2(엑셀 다운로드 암호화) 수행 및 대용량 스트리밍(`SXSSFWorkbook`) 지원을 위해 `WebContent/WEB-INF/lib` 폴더 내 구형 POI를 4.1.2로 교체합니다.

* **[규칙 준수] 대치되는 기존 5개 파일 백업 (물리적 삭제 금지)**:
  * `poi-3.8-20120326.jar` ➡️ `poi-3.8-20120326.jar_20261001`
  * `poi-ooxml-3.8-20120326.jar` ➡️ `poi-ooxml-3.8-20120326.jar_20261001`
  * `poi-ooxml-schemas-3.8-20120326.jar` ➡️ `poi-ooxml-schemas-3.8-20120326.jar_20261001`
  * `poi-scratchpad-3.8-20120326.jar` ➡️ `poi-scratchpad-3.8-20120326.jar_20261001`
  * `xmlbeans-2.3.0.jar` ➡️ `xmlbeans-2.3.0.jar_20261001`

* **신규 반입 7개 파일 (동일 폴더 `WebContent/WEB-INF/lib/`에 배치)**:
  1. `poi-4.1.2.jar`
  2. `poi-ooxml-4.1.2.jar` (핵심: Agile Encryptor 포함)
  3. `poi-ooxml-schemas-4.1.2.jar`
  4. `poi-scratchpad-4.1.2.jar`
  5. `xmlbeans-3.1.0.jar`
  6. `commons-collections4-4.4.jar` (POI 4.x 필수 의존성)
  7. `commons-compress-1.19.jar` (OOXML 스트림 필수 의존성)

---

## 5. 보안 취약점(CVE) 대응 추가 라이브러리 업그레이드 권고 (선택/권장)
현재 `WEB-INF/lib` 내부에 있는 써드파티 라이브러리 중 심각한 보안 취약점이 발견된 대상입니다. 코드를 수정할 필요 없이 **새 버전 파일로 덮어쓰기만 하면 되는 안전한 교체**입니다.

1. **`commons-fileupload-1.3.1.jar` ➡️ `commons-fileupload-1.5.jar` 로 교체**
   * 사유: 악의적인 파일 업로드 시 DoS 취약점(CVE-2016-1000031) 패치.
2. **`commons-io-2.2.jar` ➡️ `commons-io-2.15.1.jar` 로 교체**
   * 사유: 파일 경로 조작(Directory Traversal) 취약점 패치. FileUpload와 함께 업그레이드.

> **주의**: `log4j-1.2.16.jar`나 `quartz-all-1.8.3.jar`는 업그레이드 시 Java 소스 코드 전체 수정이 필요하므로 **절대 건드리지 말고 현행 유지**합니다.

---

## 6. 🚨 톰캣(Tomcat) 버전 점검 지침
* **Tomcat 9.0.x 패치**: 적극 권장 (Java 서블릿 네임스페이스 `javax.*` 유지).
* **Tomcat 10 업그레이드 금지**:
  * Tomcat 10부터 `jakarta.*` 네임스페이스로 강제 변경되어 Spring 3/4 및 전체 소스가 구동되지 않습니다. 본 CRM은 반드시 **Tomcat 9.0** 환경을 고수해야 합니다.
