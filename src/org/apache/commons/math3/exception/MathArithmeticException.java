package org.apache.commons.math3.exception;

// 20261030 khma : POI 4.1.2 Agile AES 암호화 연산 오버플로우 감지 예외 클래스
/**
 * 산술 연산(오버플로우 등) 중 발생하는 런타임 예외 클래스
 */
public class MathArithmeticException extends ArithmeticException {

	private static final long serialVersionUID = -6024911025449780478L;

	/**
	 * 기본 생성자
	 */
	public MathArithmeticException() {
		super();
	}

	/**
	 * 상세 메시지를 전달받는 생성자
	 * 
	 * @param message 상세 예외 메시지
	 */
	public MathArithmeticException(String message) {
		super(message);
	}
}
