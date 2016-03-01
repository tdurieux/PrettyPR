import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import spoon.Launcher;
import spoon.compiler.SpoonCompiler;
import spoon.reflect.declaration.CtType;
import spoon.reflect.factory.Factory;
import spoon.support.compiler.VirtualFile;
import spoon.support.compiler.jdt.JDTBasedSpoonCompiler;

public class Utils {

	public static Map<String, CtType> stringToCTElement(Map<String, String> classes) {
		// javaElement = javaElement.replace("public class", "class");
		Factory factory = createFactory().getFactory();
		factory.getEnvironment().setSourceClasspath(new String[] {});
		SpoonCompiler builder = new JDTBasedSpoonCompiler(factory);
		Map<String, CtType> output = new HashMap<String, CtType>();

		final Set<String> fileNames = classes.keySet();
		for (Iterator<String> iterator = fileNames.iterator(); iterator.hasNext();) {
			builder.getInputSources().clear();
			String filename = iterator.next();
			final String classContent = classes.get(filename);
			if (classContent != null) {
				builder.addInputSource(new VirtualFile(classContent, filename));
				try {
					builder.build();
				} catch (Exception e) {
					// ignore compilation error
				}
				final List<CtType<?>> all = factory.Type().getAll();
				for (int i = 0; i < all.size(); i++) {
					CtType<?> ctType = all.get(i);
					if (ctType.getPosition().getFile().getPath().contains(filename)) {
						output.put(filename, ctType);
					}
				}
			}
		}
		return output;
	}

	private static Launcher createFactory() {
		Launcher launcher = new Launcher();
		launcher.setSourceOutputDirectory("spoon");
		Factory factory = launcher.getFactory();
		factory.getEnvironment().setAutoImports(true);
		factory.getEnvironment().setNoClasspath(true);
		factory.getEnvironment().setComplianceLevel(8);
		// factory.getEnvironment().setPreserveLineNumbers(true);
		return launcher;
	}

	static String readFile(String path, Charset encoding) throws IOException {
		byte[] encoded = Files.readAllBytes(Paths.get(path));
		return new String(encoded, encoding);
	}

	static String readFile2(String fileName) throws IOException {
		BufferedReader br = new BufferedReader(new FileReader(fileName));
		try {
			StringBuilder sb = new StringBuilder();
			String line = br.readLine();

			while (line != null) {
				sb.append(line);
				sb.append("\n");
				line = br.readLine();
			}
			return sb.toString();
		} finally {
			br.close();
		}
	}

}
