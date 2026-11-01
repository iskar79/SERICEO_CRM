package org.apache.commons.math3.util;

import org.apache.commons.math3.exception.MathArithmeticException;

// 20261030 khma : POI 4.1.2 Agile AES 암호화(POIFSFileSystem) 필수 산술 오버플로우 체크 유틸리티
/**
 * Apache POI 4.1.2 POIFSFileSystem 및 엑셀 암호화 처리를 위한 산술 연산 유틸리티
 */
public final class ArithmeticUtils {

	/**
	 * 인스턴스 생성 방지 private 생성자
	 */
	private ArithmeticUtils() {
		super();
	}

	/**
	 * 정수 덧셈 및 오버플로우 검사
	 * 
	 * @param x 더할 값 1
	 * @param y 더할 값 2
	 * @return 덧셈 결과
	 * @throws MathArithmeticException 오버플로우 발생 시
	 */
	public static int addAndCheck(int x, int y) throws MathArithmeticException {
		long s = (long) x + (long) y;
		if (s < Integer.MIN_VALUE || s > Integer.MAX_VALUE) {
			throw new MathArithmeticException("overflow: add");
		}
		return (int) s;
	}

	/**
	 * Long 덧셈 및 오버플로우 검사
	 * 
	 * @param a 더할 값 1
	 * @param b 더할 값 2
	 * @return 덧셈 결과
	 * @throws MathArithmeticException 오버플로우 발생 시
	 */
	public static long addAndCheck(long a, long b) throws MathArithmeticException {
		long result = a + b;
		if (((a ^ result) & (b ^ result)) < 0) {
			throw new MathArithmeticException("overflow: add");
		}
		return result;
	}

	/**
	 * 정수 뺄셈 및 오버플로우 검사
	 * 
	 * @param x 피감수
	 * @param y 감수
	 * @return 뺄셈 결과
	 * @throws MathArithmeticException 오버플로우 발생 시
	 */
	public static int subAndCheck(int x, int y) throws MathArithmeticException {
		long s = (long) x - (long) y;
		if (s < Integer.MIN_VALUE || s > Integer.MAX_VALUE) {
			throw new MathArithmeticException("overflow: subtract");
		}
		return (int) s;
	}

	/**
	 * Long 뺄셈 및 오버플로우 검사
	 * 
	 * @param a 피감수
	 * @param b 감수
	 * @return 뺄셈 결과
	 * @throws MathArithmeticException 오버플로우 발생 시
	 */
	public static long subAndCheck(long a, long b) throws MathArithmeticException {
		long result = a - b;
		if (((a ^ b) & (a ^ result)) < 0) {
			throw new MathArithmeticException("overflow: subtract");
		}
		return result;
	}

	/**
	 * 정수 곱셈 및 오버플로우 검사 (POIFSFileSystem RootProperty 등에서 호출)
	 * 
	 * @param x 인수 1
	 * @param y 인수 2
	 * @return 곱셈 결과
	 * @throws MathArithmeticException 오버플로우 발생 시
	 */
	public static int mulAndCheck(int x, int y) throws MathArithmeticException {
		long m = ((long) x) * ((long) y);
		if (m < Integer.MIN_VALUE || m > Integer.MAX_VALUE) {
			throw new MathArithmeticException("overflow: mul");
		}
		return (int) m;
	}

	/**
	 * Long 곱셈 및 오버플로우 검사
	 * 
	 * @param a 인수 1
	 * @param b 인수 2
	 * @return 곱셈 결과
	 * @throws MathArithmeticException 오버플로우 발생 시
	 */
	public static long mulAndCheck(long a, long b) throws MathArithmeticException {
		if (a > b) {
			return mulAndCheck(b, a);
		}
		if (a < 0) {
			if (b < 0) {
				if (a >= Long.MAX_VALUE / b) {
					return a * b;
				}
				throw new MathArithmeticException("overflow: mul");
			} else if (b > 0) {
				if (Long.MIN_VALUE / b <= a) {
					return a * b;
				}
				throw new MathArithmeticException("overflow: mul");
			} else {
				return 0;
			}
		} else if (a > 0) {
			if (a <= Long.MAX_VALUE / b) {
				return a * b;
			}
			throw new MathArithmeticException("overflow: mul");
		} else {
			return 0;
		}
	}

	/**
	 * 최대공약수(GCD) 계산
	 * 
	 * @param a 값 1
	 * @param b 값 2
	 * @return 최대공약수
	 */
	public static int gcd(int a, int b) {
		int x = a;
		int y = b;
		while (y != 0) {
			int t = y;
			y = x % y;
			x = t;
		}
		return Math.abs(x);
	}

	/**
	 * 최대공약수(GCD) 계산 (Long)
	 * 
	 * @param a 값 1
	 * @param b 값 2
	 * @return 최대공약수
	 */
	public static long gcd(long a, long b) {
		long x = a;
		long y = b;
		while (y != 0) {
			long t = y;
			y = x % y;
			x = t;
		}
		return Math.abs(x);
	}

	/**
	 * 최소공배수(LCM) 계산
	 * 
	 * @param a 값 1
	 * @param b 값 2
	 * @return 최소공배수
	 */
	public static int lcm(int a, int b) {
		if (a == 0 || b == 0) {
			return 0;
		}
		return Math.abs(mulAndCheck(a / gcd(a, b), b));
	}

	/**
	 * 최소공배수(LCM) 계산 (Long)
	 * 
	 * @param a 값 1
	 * @param b 값 2
	 * @return 최소공배수
	 */
	public static long lcm(long a, long b) {
		if (a == 0 || b == 0) {
			return 0;
		}
		return Math.abs(mulAndCheck(a / gcd(a, b), b));
	}

	/**
	 * 2의 거듭제곱 여부 확인
	 * 
	 * @param n 검사할 값
	 * @return 2의 거듭제곱이면 true
	 */
	public static boolean isPowerOfTwo(long n) {
		return (n > 0) && ((n & (n - 1)) == 0);
	}
}
