package rest.api;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * Created by denis on 23/03/16.
 */


@XmlRootElement
public class MessageResponse {

    private String response;

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }
}
