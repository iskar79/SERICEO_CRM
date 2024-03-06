package co.kr.kydbm.core.exception;

public class LoginException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 8373742808562555690L;

	public LoginException(Exception cause) {
        super(cause) ;
    }

    public LoginException(String message) {
        super(message) ;
    }

    public LoginException(String message, Throwable cause) {
        super(message, cause) ;
    }
}
