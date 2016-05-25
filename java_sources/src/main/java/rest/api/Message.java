package rest.api;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * Created by denis on 23/03/16.
 */

@XmlRootElement
public class Message {

    private String text;
    private String author;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }
}
