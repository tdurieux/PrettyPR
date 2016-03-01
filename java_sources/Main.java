import java.io.IOException;
import java.nio.charset.Charset;

public class Main {
	public static void main(String[] args) {

		if (args.length != 4) {
			System.out.println("Usage: java -jar prettyPR.jar [oldClassName] [oldJavaPathToFile] [newClassName] [newJavaPathToFile]");
			return;
		}

			String oldContentPath = args[1];
			String newContentPath = args[3];
			
			String oldContentName = args[0];
			String newContentName = args[2];
			
			String oldContent = "";
			String newContent = "";

			try {
				oldContent = Utils.readFile2(oldContentPath);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			try {
				newContent = Utils.readFile2(newContentPath);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		

		// USAGE: java prettyPR arg0=nomFichierOld arg1=fichierOld
		// arg2=nomFichierNew arg3=FichierNew
		PrettyPR pr = new PrettyPR(oldContentName, newContent, newContentName, oldContent);

		pr.getListeActions();

	}
}
