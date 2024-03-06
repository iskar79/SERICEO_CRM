package co.kr.kydbm.core.utils;

public class ConfigProperties extends PropertyUtil{
	
	private static ConfigProperties instance;
	
	public static ConfigProperties getInstance(){
		if(instance == null){
			instance = new ConfigProperties();
			instance.init("monarch.properties");
		}
		return instance;
	}
	
}

