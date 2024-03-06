package co.kr.kydbm.core.exception;

public class AuthException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public AuthException(Exception cause) {
        super(cause) ;
    }

    public AuthException(String message) {
        super(message) ;
    }

    public AuthException(String message, Throwable cause) {
        super(message, cause) ;
    }
}
