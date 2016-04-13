angular.module('prettyPr')
.directive("diffClass", function ($compile, $http) {
  function generateLineNumber(line) {
      return "<td class=\"lineNumber\">"  + (line!=null?(line + 1):'') + "</td>";
  }
  function generateTable() {
      return "<table class=\"codeDiff\" cellpadding=\"0\" cellspacing=\"0\"><colgroup><col width=\"44\"><col><col width=\"44\"><col></colgroup>";
  }
  function formatCode(content) {
      return Prism.highlight(content, Prism.languages.java);
  }
  return {
    restrict: 'E',
    replace: true,
    scope: {
      change: '=change'
    },
    link: function (scope, element, attrs) {
            element.html("");
            var oldFile = scope.change.oldFile;
            var newFile = scope.change.newFile;

            var re=/\r\n|\n\r|\n|\r/g;
            function splitLine(content) {
                return content.split("\n");
            }

            if(oldFile) {
                oldLines = splitLine(oldFile);
            } else {
                oldLines=[];
            }
            if(newFile) {
                newLines = splitLine(newFile);
            } else {
                newLines=[];
            }

            var changedLineOld = [];
            var changedLineNew = [];
            for(var j in scope.change.actions) {
                var action = scope.change.actions[j];
                if(action.newLocation) {
                    for (var i = action.newLocation.line; i <= action.newLocation.endLine; i++) {
                        if(!changedLineNew[i]) {
                            changedLineNew[i] = []
                        }
                        changedLineNew[i].push(action);
                    };
                }
                if(action.oldLocation) {
                    for (var i = action.oldLocation.line; i <= action.oldLocation.endLine; i++) {
                        if(!changedLineOld[i]) {
                            changedLineOld[i] = []
                        }
                        changedLineOld[i].push(action);
                    }
                }
            }

            var newTable = true;
            var countNoChange = 0;
            var output = "";
            var positionNew = 0;
            var positionOld = 0;

            var nbLineAround = 5;

            if(oldFile) {
                var indexOld = oldFile.indexOf("class");
                if(indexOld == -1) {
                    indexOld = oldFile.indexOf("interface");
                }
                var oldStartIndex = splitLine(oldFile.substring(0, indexOld)).length;
            } else {
                var oldStartIndex = -1;
            }
            if(newFile) {
                var indexNew = newFile.indexOf("class");
                if(indexNew == -1) {
                    indexNew = newFile.indexOf("interface");
                }
                var newStartIndex = splitLine(newFile.substring(0, indexNew)).length;
            } else {
                var newStartIndex = -1;
            }

            var nbNewLine = 0;
            var nbDeletedLine = 0;

            if(newStartIndex > oldStartIndex && newStartIndex != -1 && oldStartIndex != -1) {
                nbDeletedLine = oldStartIndex - newStartIndex;
            } else if(newStartIndex < oldStartIndex && newStartIndex != -1 && oldStartIndex != -1) {
                nbNewLine = newStartIndex - oldStartIndex;
            }

            for (var i = 0; i < Math.max(newLines.length, oldLines.length); i++) {
                var display = false;

                var newLineNumber = i + nbNewLine;
                var oldLineNumber = i + nbDeletedLine;

                var lineNew = changedLineNew[newLineNumber + 1];
                var lineOld = changedLineOld[oldLineNumber + 1];

                for (var k = newLineNumber; k <= newLineNumber + nbLineAround && !display; k++) {
                    if(changedLineNew.length > k  && changedLineNew[k + 1]) {
                        display = true;
                    }
                }
                for (var k = oldLineNumber; k <= oldLineNumber + nbLineAround && !display; k++) {
                     if(changedLineOld.length > k  && changedLineOld[k + 1]) {
                        display = true;
                    }
                }
                function genereteCodeDiff(line, actions, type) {
                    var output = "";
                    if(line == undefined) return output;
                    output += ("<pre><code>");

                    if(!actions || actions.length == 0) {
                        output += formatCode(line);
                    } else {
                        actions = actions.sort(function (a, b) {
                            if(type == "old") {
                                return a.oldLocation.sourceStart - b.oldLocation.sourceStart;
                            } else {
                                return a.newLocation.sourceStart - b.newLocation.sourceStart;
                            }
                        });
                        var action = actions[0];
                        var location = action.newLocation;
                        if(type == "old") {
                            location = action.oldLocation;
                        }
                        var currentPosition = positionNew;
                        if(type == "old") {
                            currentPosition = positionOld;
                        }
                        var diff = location.sourceStart - currentPosition;

                        output += formatCode(line.substring(0, diff));

                        var changedCode = line.substring(diff, location.sourceEnd - currentPosition + 1);
                        for (var l = 0; l < changedCode.length; l++) {
                            if(changedCode[l] != " " && changedCode[l] != "\t") {
                                break;
                            }
                        }
                        var contentBeforeChange = changedCode.substring(0, l);
                        var contentAfterChange = line.substring(location.sourceEnd - currentPosition + 1);
                        if(contentBeforeChange.trim().length == 0 &&
                            contentAfterChange.replace(";", "").trim().length == 0) {
                            if(action.action == "Delete" || (
                                action.action == "Move" && type == "old")) {
                                nbDeletedLine ++;
                            } else if(type == "new" && action.action != "Update") {
                                nbNewLine ++;
                            }
                        }
                        output += contentBeforeChange;
                        output += "<span class=\"" + action.action + "\">";
                        output += formatCode(changedCode.substring(l));
                        output += "</span>";
                        output += formatCode(contentAfterChange);
                    }
                    output += "</code></pre>";
                    return output;
                }

                var hiddeNew = false;
                var hiddeOld = false;
                if(!display) {
                    if(!newTable) {
                        countNoChange ++;
                        output += "<tr>";
                        output += generateLineNumber(newLines[newLineNumber]!=null?newLineNumber:null);
                        output += "<td class=\"code\">";
                        output += genereteCodeDiff(newLines[newLineNumber], lineNew, "new");
                        output += "</td>";
                        output += generateLineNumber(oldLines[oldLineNumber]!=null?oldLineNumber:null);
                        output += "<td class=\"code\">";
                        output += genereteCodeDiff(oldLines[oldLineNumber], lineOld, "old");
                        output += "</td></tr>";
                    }
                } else {
                    if(newTable) {
                        output += generateTable();
                    }
                    newTable = false;
                    countNoChange = 0;

                    var actions = [];
                    if(lineNew) {
                        for (var l = lineNew.length - 1; l >= 0; l--) {
                            actions.push(lineNew[l]);
                        }
                    }
                    if(lineOld) {
                        for (var l = lineOld.length - 1; l >= 0; l--) {
                            actions.push(lineOld[l]);
                        }
                    }

                    var tmpNbNew = nbNewLine;

                    var newCodeDiff = genereteCodeDiff(newLines[newLineNumber], lineNew, "new");
                    var diffNew = nbNewLine - tmpNbNew;

                    var tmpNbDel = nbDeletedLine;
                    var oldCodeDiff = genereteCodeDiff(oldLines[oldLineNumber], lineOld, "old");
                    var diffDel = nbDeletedLine - tmpNbDel;

                    output += "<tr>";
                    if(diffDel > diffNew) {
                        hiddeNew = true;
                        output += generateLineNumber();
                        output += "<td class=\"code\"></td>";
                    } else {
                        output += generateLineNumber(newLines[newLineNumber]!=null?newLineNumber: null);
                        output += "<td class=\"code\">";
                        output += newCodeDiff;
                        output += "</td>";
                    }

                    if(diffNew > diffDel) {
                        hiddeOld = true;
                        output += generateLineNumber();
                        output += "<td class=\"code\"></td></tr>";
                    } else {
                        output += generateLineNumber(oldLines[oldLineNumber]!=null?oldLineNumber:null);
                        output += "<td class=\"code\">";
                        output += oldCodeDiff;
                        output += "</td></tr>";
                    }

                    if(hiddeOld || hiddeNew || (diffNew == diffDel && diffDel > 0) ) {
                         i--;
                    }
                    if(diffDel > 0 && hiddeOld) {
                        nbDeletedLine --;
                    } else if(diffNew > 0 && hiddeNew) {
                        nbNewLine --;
                    }
                }
                if((countNoChange >= nbLineAround || i >= Math.max(newLines.length, oldLines.length) - 1) && output != "") {
                    newTable = true;

                    output += ("</table>");

                    element.append(output + "<hr>");
                    //$compile(element.contents())(scope);
                    output = "";
                }
                if(!hiddeNew && newLines[newLineNumber] != undefined) {
                    positionNew += newLines[newLineNumber].length + 1;
                }
                if(!hiddeOld && oldLines[oldLineNumber] != undefined) {
                    positionOld += oldLines[oldLineNumber].length + 1;
                }
            }
        }
  };
}).directive('results', function() {
  function groupBy(arr, property) {
    return arr.reduce(function(memo, x) {
      if (!memo[x.location[property]]) { memo[x.location[property]] = []; }
      memo[x.location[property]].push(x);
      return memo;
    }, {});
  }
  return {
    restrict: 'E',
    templateUrl: 'client/results/results.html',
    controllerAs: 'results',
    controller: function($scope, $reactive, cfpLoadingBar, $location, sharedProperties, $document) {
      $reactive(this).attach($scope);
      this.result = sharedProperties.getChangement();

      //Attribut pour le bouton menu
      this.topDirections = ['left', 'up'];
      this.bottomDirections = ['down', 'right'];
      this.isOpen = false;
      this.availableModes = ['md-fling', 'md-scale'];
      this.selectedMode = 'md-fling';
      this.availableDirections = ['up', 'down', 'left', 'right'];
      this.selectedDirection = 'up';


      //On va appliquer des identificateurs spéciaux sur les premiers des 3 listes
      this.rowClass = (item, $index) => {
        if(item.location.type == "Interface" && $index == 0){
          return "firstInterface";
        }

        if(item.location.type == "Class" && $index == 0){
          return "firstClass";
        }

        if(item.location.type == "Test" && $index == 0){
          return "firstTest";
        }
      }

      //méthode pour scroll vers une des 3 catégories
      this.scroll = (type) => {
        var element = document.getElementsByClassName(type);
        if(element.length) {
          window.scrollTo(0, (element[0].offsetTop) - 100);
        }
      }

      //On sépare les changements en 3 listes (class, interface & tests)
      if(this.result){
        var changes = groupBy(this.result.changes, "type");
        this.classes = changes.Class;
        this.interfaces = changes.Interface;
        this.tests = changes.Test;
      }

    }
  }
});
