package rest.api;

/**
 * Created by denis on 23/03/16.
 */


import prettyPR.PrettyPR;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/api")
public class Api {


/*
    {
        "oldFileName": "HelloWorld",
            "newFileName": "HelloWorld",
            "oldFile": "public class HelloWorld { \n   public static void main(String[] args) { \n      System.out.println(\"Hello, World\");\n   }\n}",
            "newFile": "public class HelloWorld { \n   public static void main(String[] args) { \n      System.out.println(\"Hello, World\");\n      int i = 0;\n      System.out.println(\"Hello, World \" + i);\n      i = i + 1;\n      System.out.println(\"Hello, World \" + i);\n   }\n}"
    }

*/


    @POST
    @Path("/prettypr")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public String prettypr(MessageRequest msg) throws Exception {

        PrettyPR prettyPR = new PrettyPR(msg.getOldFileName(), msg.getOldFile(), msg.getNewFileName(), msg.getNewFile());
        return prettyPR.getListeActions();
    }

}