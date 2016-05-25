package prettyPR;

import com.github.gumtreediff.actions.model.Action;
import com.github.gumtreediff.actions.model.Delete;
import com.github.gumtreediff.actions.model.Move;
import com.github.gumtreediff.actions.model.Update;
import fr.inria.sacha.spoon.diffSpoon.CtDiff;
import fr.inria.sacha.spoon.diffSpoon.DiffSpoon;
import fr.inria.sacha.spoon.diffSpoon.DiffSpoonImpl;
import fr.inria.sacha.spoon.diffSpoon.SpoonGumTreeBuilder;
import org.json.JSONObject;
import spoon.reflect.declaration.CtElement;
import spoon.reflect.declaration.CtType;
import utils.Utils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PrettyPR {

    private String newContent;
    private String oldContent;
    private String nomNew;
    private String nomOld;

    public PrettyPR(String nomOld, String oldContent, String nomNew, String newContent) {
        this.oldContent = oldContent;
        this.newContent = newContent;
        this.nomNew = nomNew;
        this.nomOld = nomOld;
    }

    public String getListeActions() {

        Map<String, CtType> oldTypes = new HashMap<String, CtType>();
        Map<String, CtType> newTypes = new HashMap<String, CtType>();

        HashMap<String, String> mNewContent = new HashMap<String, String>();
        HashMap<String, String> mOldContent = new HashMap<String, String>();
        mNewContent.put(nomNew, this.newContent);
        mOldContent.put(nomOld, this.oldContent);

        newTypes = Utils.stringToCTElement(mNewContent);
        oldTypes = Utils.stringToCTElement(mOldContent);


        final CtType newCl;
        final CtType oldCl;
        DiffSpoon diffSpoon = null;

        JSONObject jActions = new JSONObject();

        try {

            if (newTypes.get(nomNew) != null) {
                newCl = newTypes.get(nomNew);
                diffSpoon = new DiffSpoonImpl(newCl.getFactory());
            } else {
                newCl = null;
            }

            if (oldTypes.get(nomOld) != null) {
                oldCl = oldTypes.get(nomOld);
                if (diffSpoon == null) {
                    diffSpoon = new DiffSpoonImpl(oldCl.getFactory());
                }
            } else {
                oldCl = null;
                if (newCl == null) {
                    diffSpoon = new DiffSpoonImpl();
                }
            }
            CtDiff results = diffSpoon.compare(oldCl, newCl);
            CtElement ctElement = results.commonAncestor();
            List<Action> actions = results.getRootActions();

            for (Action action : actions) {
                CtElement element = (CtElement) action.getNode().getMetadata(
                        SpoonGumTreeBuilder.SPOON_OBJECT);
                JSONObject jsonAction = new JSONObject();
                // action name
                jsonAction.accumulate("action", action.getClass().getSimpleName());

                // node type
                String nodeType = element.getClass().getSimpleName();
                nodeType = nodeType.substring(2, nodeType.length() - 4);
                jsonAction.accumulate("nodeType", nodeType);

                JSONObject actionPositionJSON = new JSONObject();
                if (element.getPosition() != null) {
                    actionPositionJSON
                            .put("line", element.getPosition().getLine());
                    actionPositionJSON.put("sourceStart",
                            element.getPosition().getSourceStart());
                    actionPositionJSON.put("sourceEnd",
                            element.getPosition().getSourceEnd());
                    actionPositionJSON.put("endLine",
                            element.getPosition().getEndLine());

                }
                if (action instanceof Delete ||
                        action instanceof Update ||
                        action instanceof Move) {
                    jsonAction.put("oldLocation", actionPositionJSON);
                } else {
                    jsonAction.put("newLocation", actionPositionJSON);
                }

                // action position
                if (action instanceof Move ||
                        action instanceof Update) {
                    CtElement elementDest = (CtElement) action.getNode().getMetadata(SpoonGumTreeBuilder.SPOON_OBJECT_DEST);

                    JSONObject actionDestPositionJSON = new JSONObject();
                    if (elementDest.getPosition() != null) {
                        actionDestPositionJSON.put("line",
                                elementDest.getPosition().getLine());
                        actionDestPositionJSON.put("sourceStart",
                                elementDest.getPosition().getSourceStart());
                        actionDestPositionJSON.put("sourceEnd",
                                elementDest.getPosition().getSourceEnd());
                        actionDestPositionJSON.put("endLine",
                                elementDest.getPosition().getEndLine());
                    }
                    jsonAction.put("newLocation", actionDestPositionJSON);
                }

                // if all actions are applied on the same node print only the first action
                if (element.equals(ctElement) && action instanceof Update) {
                    break;
                }
                jActions.append("actions", jsonAction);
            }

        } catch (Exception e) {
            e.printStackTrace();
            JSONObject error = new JSONObject();
            error.accumulate("message", e.getMessage());
            error.accumulate("exception", e);
            return error.toString();
        }
        return jActions.toString();

    }

}