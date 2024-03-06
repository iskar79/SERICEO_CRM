package co.kr.kydbm.core.utils;


import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "XmlParms")
public class XmlParmsEntity {
	
	@XmlElement
	private String xmlParms;

	public String getXmlParms() {
		return xmlParms;
	}

	public void setXmlParms(String xmlParms) {
		this.xmlParms = xmlParms;
	}
}
