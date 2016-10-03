/**
 * jsPDF AcroForm Plugin
 * Copyright (c) 2016 Alexander Weidt, https://github.com/BiggA94
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

(window.AcroForm = function (jsPDFAPI) {
    'use strict';

    var AcroForm = window.AcroForm;

    AcroForm.scale = function (x) {
        return (x * (acroformPlugin.internal.scaleFactor / 1));// 1 = (96 / 72)
    };
    AcroForm.antiScale = function (x) {
        return ((1 / acroformPlugin.internal.scaleFactor ) * x);
    };

    var acroformPlugin = {
        fields: [],
        xForms: [],
        /**
         * acroFormDictionaryRoot contains information about the AcroForm Dictionary
         * 0: The Event-Token, the AcroFormDictionaryCallback has
         * 1: The Object ID of the Root
         */
        acroFormDictionaryRoot: null,
        /**
         * After the PDF gets evaluated, the reference to the root has to be reset,
         * this indicates, whether the root has already been printed out
         */
        printedOut: false,
        internal: null
    };

    jsPDF.API.acroformPlugin = acroformPlugin;

    var annotReferenceCallback = function () {
        for (var i in this.acroformPlugin.acroFormDictionaryRoot.Fields) {
            var formObject = this.acroformPlugin.acroFormDictionaryRoot.Fields[i];
            // add Annot Reference!
            if (formObject.hasAnnotation) {
                // If theres an Annotation Widget in the Form Object, put the Reference in the /Annot array
                createAnnotationReference.call(this, formObject);
            }
        }
    };

    var createAcroForm = function () {
        if (this.acroformPlugin.acroFormDictionaryRoot) {
            //return;
            throw new Error("Exception while creating AcroformDictionary");
        }

        // The Object Number of the AcroForm Dictionary
        this.acroformPlugin.acroFormDictionaryRoot = new AcroForm.AcroFormDictionary();

        this.acroformPlugin.internal = this.internal;

        // add Callback for creating the AcroForm Dictionary
        this.acroformPlugin.acroFormDictionaryRoot._eventID = this.internal.events.subscribe('postPutResources', AcroFormDictionaryCallback);

        this.internal.events.subscribe('buildDocument', annotReferenceCallback); //buildDocument

        // Register event, that is triggered when the DocumentCatalog is written, in order to add /AcroForm
        this.internal.events.subscribe('putCatalog', putCatalogCallback);

        // Register event, that creates all Fields
        this.internal.events.subscribe('postPutPages', createFieldCallback);
    };

    /**
     * Create the Reference to the widgetAnnotation, so that it gets referenced in the Annot[] int the+
     * (Requires the Annotation Plugin)
     */
    var createAnnotationReference = function (object) {
        var options = {
            type: 'reference',
            object: object
        };
        jsPDF.API.annotationPlugin.annotations[this.internal.getPageInfo(object.page).pageNumber].push(options);
    };

    var putForm = function (formObject) {
        if (this.acroformPlugin.printedOut) {
            this.acroformPlugin.printedOut = false;
            this.acroformPlugin.acroFormDictionaryRoot = null;
        }
        if (!this.acroformPlugin.acroFormDictionaryRoot) {
            createAcroForm.call(this);
        }
        this.acroformPlugin.acroFormDictionaryRoot.Fields.push(formObject);
    };

    // Callbacks

    var putCatalogCallback = function () {
        //Put reference to AcroForm to DocumentCatalog
        if (typeof this.acroformPlugin.acroFormDictionaryRoot != 'undefined') { // for safety, shouldn't normally be the case
            this.internal.write('/AcroForm ' + this.acroformPlugin.acroFormDictionaryRoot.objId + ' '
                + 0 + ' R');
        } else {
            console.log('Root missing...');
        }
    };

    /**
     * Adds /Acroform X 0 R to Document Catalog,
     * and creates the AcroForm Dictionary
     */
    var AcroFormDictionaryCallback = function () {
        // Remove event
        this.internal.events.unsubscribe(this.acroformPlugin.acroFormDictionaryRoot._eventID);

        delete this.acroformPlugin.acroFormDictionaryRoot._eventID;

        this.acroformPlugin.printedOut = true;
    };

    /**
     * Creates the single Fields and writes them into the Document
     *
     * If fieldArray is set, use the fields that are inside it instead of the fields from the AcroRoot
     * (for the FormXObjects...)
     */
    var createFieldCallback = function (fieldArray) {
        var standardFields = (!fieldArray);

        if (!fieldArray) {
            // in case there is no fieldArray specified, we wanna print out the Fields of the AcroForm
            // Print out Root
            this.internal.newObjectDeferredBegin(this.acroformPlugin.acroFormDictionaryRoot.objId);
            this.internal.out(this.acroformPlugin.acroFormDictionaryRoot.getString());
        }

        var fieldArray = fieldArray || this.acroformPlugin.acroFormDictionaryRoot.Kids;

        for (var i in fieldArray) {
            var key = i;
            var form = fieldArray[i];

            var oldRect = form.Rect;

            if (form.Rect) {
                form.Rect = AcroForm.internal.calculateCoordinates.call(this, form.Rect);
            }

            // Start Writing the Object
            this.internal.newObjectDeferredBegin(form.objId);

            var content = "";
            content += (form.objId + " 0 obj\n");

            content += ("<<\n" + form.getContent());

            form.Rect = oldRect;

            if (form.hasAppearanceStream && !form.appearanceStreamContent) {
                // Calculate Appearance
                var appearance = AcroForm.internal.calculateAppearanceStream.call(this, form);
                content += "/AP << /N " + appearance + " >>\n";

                this.acroformPlugin.xForms.push(appearance);
            }

            // Assume AppearanceStreamContent is a Array with N,R,D (at least one of them!)
            if (form.appearanceStreamContent) {
                content += "/AP << ";
                // Iterate over N,R and D
                for (var k in form.appearanceStreamContent) {
                    var value = form.appearanceStreamContent[k];
                    content += ("/" + k + " ");
                    content += "<< ";
                    if (Object.keys(value).length >= 1 || Array.isArray(value)) {
                        // appearanceStream is an Array or Object!
                        for (var i in value) {
                            var obj = value[i];
                            if (typeof obj === 'function') {
                                // if Function is referenced, call it in order to get the FormXObject
                                obj = obj.call(this, form);
                            }
                            content += ("/" + i + " " + obj + " ");

                            // In case the XForm is already used, e.g. OffState of CheckBoxes, don't add it
                            if (!(this.acroformPlugin.xForms.indexOf(obj) >= 0))
                                this.acroformPlugin.xForms.push(obj);
                        }
                    } else {
                        var obj = value;
                        if (typeof obj === 'function') {
                            // if Function is referenced, call it in order to get the FormXObject
                            obj = obj.call(this, form);
                        }
                        content += ("/" + i + " " + obj + " \n");
                        if (!(this.acroformPlugin.xForms.indexOf(obj) >= 0))
                            this.acroformPlugin.xForms.push(obj);
                    }
                    content += " >>\n";
                }

                // appearance stream is a normal Object..
                content += (">>\n");
            }

            content += (">>\nendobj\n");

            this.internal.out(content);

        }
        if (standardFields) {
            createXFormObjectCallback.call(this, this.acroformPlugin.xForms);
        }
    };

    var createXFormObjectCallback = function (fieldArray) {
        for (var i in fieldArray) {
            var key = i;
            var form = fieldArray[i];
            // Start Writing the Object
            this.internal.newObjectDeferredBegin(form && form.objId);

            var content = "";
            content += form ? form.getString() : '';
            this.internal.out(content);

            delete fieldArray[key];
        }
    };

    // Public:

    jsPDFAPI.addField = function (fieldObject) {
        //var opt = parseOptions(fieldObject);
        if (fieldObject instanceof AcroForm.TextField) {
            addTextField.call(this, fieldObject);
        } else if (fieldObject instanceof AcroForm.ChoiceField) {
            addChoiceField.call(this, fieldObject);
        } else if (fieldObject instanceof AcroForm.Button) {
            addButton.call(this, fieldObject);
        } else if (fieldObject instanceof AcroForm.ChildClass) {
            putForm.call(this, fieldObject);
        } else if (fieldObject) {
            // try to put..
            putForm.call(this, fieldObject);
        }
        fieldObject.page = this.acroformPlugin.internal.getCurrentPageInfo().pageNumber;
        return this;
    };


    // ############### sort in:

    /**
     * Button
     * FT = Btn
     */
    var addButton = function (options) {
        var options = options || new AcroForm.Field();

        options.FT = '/Btn';

        /**
         * Calculating the Ff entry:
         *
         * The Ff entry contains flags, that have to be set bitwise
         * In the Following the number in the Comment is the BitPosition
         */
        var flags = options.Ff || 0;

        // 17, Pushbutton
        if (options.pushbutton) {
            // Options.pushbutton should be 1 or 0
            flags = AcroForm.internal.setBitPosition(flags, 17);
            delete options.pushbutton;
        }

        //16, Radio
        if (options.radio) {
            //flags = options.Ff | options.radio << 15;
            flags = AcroForm.internal.setBitPosition(flags, 16);
            delete options.radio;
        }

        // 15, NoToggleToOff (Radio buttons only
        if (options.noToggleToOff) {
            //flags = options.Ff | options.noToggleToOff << 14;
            flags = AcroForm.internal.setBitPosition(flags, 15);
            //delete options.noToggleToOff;
        }

        // In case, there is no Flag set, it is a check-box
        options.Ff = flags;

        putForm.call(this, options);

    };


    var addTextField = function (options) {
        var options = options || new AcroForm.Field();

        options.FT = '/Tx';

        /**
         * Calculating the Ff entry:
         *
         * The Ff entry contains flags, that have to be set bitwise
         * In the Following the number in the Comment is the BitPosition
         */

        var flags = options.Ff || 0;

        // 13, multiline
        if (options.multiline) {
            // Set Flag
            flags = flags | (1 << 12);
            // Remove multiline from FieldObject
            //delete options.multiline;
        }

        // 14, Password
        if (options.password) {
            flags = flags | (1 << 13);
            //delete options.password;
        }

        // 21, FileSelect, PDF 1.4...
        if (options.fileSelect) {
            flags = flags | (1 << 20);
            //delete options.fileSelect;
        }

        // 23, DoNotSpellCheck, PDF 1.4...
        if (options.doNotSpellCheck) {
            flags = flags | (1 << 22);
            //delete options.doNotSpellCheck;
        }

        // 24, DoNotScroll, PDF 1.4...
        if (options.doNotScroll) {
            flags = flags | (1 << 23);
            //delete options.doNotScroll;
        }

        options.Ff = options.Ff || flags;

        // Add field
        putForm.call(this, options);
    };

    var addChoiceField = function (opt) {
        var options = opt || new AcroForm.Field();

        options.FT = '/Ch';

        /**
         * Calculating the Ff entry:
         *
         * The Ff entry contains flags, that have to be set bitwise
         * In the Following the number in the Comment is the BitPosition
         */

        var flags = options.Ff || 0;

        // 18, Combo (If not set, the choiceField is a listBox!!)
        if (options.combo) {
            // Set Flag
            flags = AcroForm.internal.setBitPosition(flags, 18);
            // Remove combo from FieldObject
            delete options.combo;
        }

        // 19, Edit
        if (options.edit) {
            flags = AcroForm.internal.setBitPosition(flags, 19);
            delete options.edit;
        }

        // 20, Sort
        if (options.sort) {
            flags = AcroForm.internal.setBitPosition(flags, 20);
            delete options.sort;
        }

        // 22, MultiSelect (PDF 1.4)
        if (options.multiSelect && this.internal.getPDFVersion() >= 1.4) {
            flags = AcroForm.internal.setBitPosition(flags, 22);
            delete options.multiSelect;
        }

        // 23, DoNotSpellCheck (PDF 1.4)
        if (options.doNotSpellCheck && this.internal.getPDFVersion() >= 1.4) {
            flags = AcroForm.internal.setBitPosition(flags, 23);
            delete options.doNotSpellCheck;
        }

        options.Ff = flags;

        //options.hasAnnotation = true;

        // Add field
        putForm.call(this, options);
    };
})(jsPDF.API);

var AcroForm = window.AcroForm;

AcroForm.internal = {};

AcroForm.createFormXObject = function (formObject) {
    var xobj = new AcroForm.FormXObject;
    var height = AcroForm.Appearance.internal.getHeight(formObject) || 0;
    var width = AcroForm.Appearance.internal.getWidth(formObject) || 0;
    xobj.BBox = [0, 0, width, height];
    return xobj;
};

// Contains Methods for creating standard appearances
AcroForm.Appearance = {
    CheckBox: {
        createAppearanceStream: function () {
            var appearance = {
                N: {
                    On: AcroForm.Appearance.CheckBox.YesNormal
                },
                D: {
                    On: AcroForm.Appearance.CheckBox.YesPushDown,
                    Off: AcroForm.Appearance.CheckBox.OffPushDown
                }
            };

            return appearance;
        },
        /**
         * If any other icons are needed, the number between the brackets can be changed
         * @returns {string}
         */
        createMK: function () {
            // 3-> Hook
            return "<< /CA (3)>>";
        },
        /**
         * Returns the standard On Appearance for a CheckBox
         * @returns {AcroForm.FormXObject}
         */
        YesPushDown: function (formObject) {
            var xobj = AcroForm.createFormXObject(formObject);
            var stream = "";
            // F13 is ZapfDingbats (Symbolic)
            formObject.Q = 1; // set text-alignment as centered
            var calcRes = AcroForm.internal.calculateX(formObject, "3", "ZapfDingbats", 50);
            stream += "0.749023 g\n\
             0 0 " + AcroForm.Appearance.internal.getWidth(formObject) + " " + AcroForm.Appearance.internal.getHeight(formObject) + " re\n\
             f\n\
             BMC\n\
             q\n\
             0 0 1 rg\n\
             /F13 " + calcRes.fontSize + " Tf 0 g\n\
             BT\n";
            stream += calcRes.text;
            stream += "ET\n\
             Q\n\
             EMC\n";
            xobj.stream = stream;
            return xobj;
        },

        YesNormal: function (formObject) {
            var xobj = AcroForm.createFormXObject(formObject);
            var stream = "";
            formObject.Q = 1; // set text-alignment as centered
            var calcRes = AcroForm.internal.calculateX(formObject, "3", "ZapfDingbats", AcroForm.Appearance.internal.getHeight(formObject) * 0.9);
            stream += "1 g\n\
0 0 " + AcroForm.Appearance.internal.getWidth(formObject) + " " + AcroForm.Appearance.internal.getHeight(formObject) + " re\n\
f\n\
q\n\
0 0 1 rg\n\
0 0 " + (AcroForm.Appearance.internal.getWidth(formObject) - 1) + " " + (AcroForm.Appearance.internal.getHeight(formObject) - 1) + " re\n\
W\n\
n\n\
0 g\n\
BT\n\
/F13 " + calcRes.fontSize + " Tf 0 g\n";
            stream += calcRes.text;
            stream += "ET\n\
             Q\n";
            xobj.stream = stream;
            return xobj;
        },

        /**
         * Returns the standard Off Appearance for a CheckBox
         * @returns {AcroForm.FormXObject}
         */
        OffPushDown: function (formObject) {
            var xobj = AcroForm.createFormXObject(formObject);
            var stream = "";
            stream += "0.749023 g\n\
            0 0 " + AcroForm.Appearance.internal.getWidth(formObject) + " " + AcroForm.Appearance.internal.getHeight(formObject) + " re\n\
            f\n";
            xobj.stream = stream;
            return xobj;
        }
    },

    RadioButton: {
        Circle: {
            createAppearanceStream: function (name) {
                var appearanceStreamContent = {
                    D: {
                        'Off': AcroForm.Appearance.RadioButton.Circle.OffPushDown
                    },
                    N: {}
                };
                appearanceStreamContent.N[name] = AcroForm.Appearance.RadioButton.Circle.YesNormal;
                appearanceStreamContent.D[name] = AcroForm.Appearance.RadioButton.Circle.YesPushDown;
                return appearanceStreamContent;
            },
            createMK: function () {
                return "<< /CA (l)>>";
            },

            YesNormal: function (formObject) {
                var xobj = AcroForm.createFormXObject(formObject);
                var stream = "";
                // Make the Radius of the Circle relative to min(height, width) of formObject
                var DotRadius = (AcroForm.Appearance.internal.getWidth(formObject) <= AcroForm.Appearance.internal.getHeight(formObject)) ?
                AcroForm.Appearance.internal.getWidth(formObject) / 4 : AcroForm.Appearance.internal.getHeight(formObject) / 4;
                // The Borderpadding...
                DotRadius *= 0.9;
                var c = AcroForm.Appearance.internal.Bezier_C;
                /*
                 The Following is a Circle created with Bezier-Curves.
                 */
                stream += "q\n\
1 0 0 1 " + AcroForm.Appearance.internal.getWidth(formObject) / 2 + " " + AcroForm.Appearance.internal.getHeight(formObject) / 2 + " cm\n\
" + DotRadius + " 0 m\n\
" + DotRadius + " " + DotRadius * c + " " + DotRadius * c + " " + DotRadius + " 0 " + DotRadius + " c\n\
-" + DotRadius * c + " " + DotRadius + " -" + DotRadius + " " + DotRadius * c + " -" + DotRadius + " 0 c\n\
-" + DotRadius + " -" + DotRadius * c + " -" + DotRadius * c + " -" + DotRadius + " 0 -" + DotRadius + " c\n\
" + DotRadius * c + " -" + DotRadius + " " + DotRadius + " -" + DotRadius * c + " " + DotRadius + " 0 c\n\
f\n\
Q\n";
                xobj.stream = stream;
                return xobj;
            },
            YesPushDown: function (formObject) {
                var xobj = AcroForm.createFormXObject(formObject);
                var stream = "";
                var DotRadius = (AcroForm.Appearance.internal.getWidth(formObject) <= AcroForm.Appearance.internal.getHeight(formObject)) ?
                AcroForm.Appearance.internal.getWidth(formObject) / 4 : AcroForm.Appearance.internal.getHeight(formObject) / 4;
                // The Borderpadding...
                DotRadius *= 0.9;
                var c = AcroForm.Appearance.internal.Bezier_C;
                stream += "0.749023 g\n\
            q\n\
           1 0 0 1 " + AcroForm.Appearance.internal.getWidth(formObject) / 2 + " " + AcroForm.Appearance.internal.getHeight(formObject) / 2 + " cm\n\
" + DotRadius * 2 + " 0 m\n\
" + DotRadius * 2 + " " + DotRadius * 2 * c + " " + DotRadius * 2 * c + " " + DotRadius * 2 + " 0 " + DotRadius * 2 + " c\n\
-" + DotRadius * 2 * c + " " + DotRadius * 2 + " -" + DotRadius * 2 + " " + DotRadius * 2 * c + " -" + DotRadius * 2 + " 0 c\n\
-" + DotRadius * 2 + " -" + DotRadius * 2 * c + " -" + DotRadius * 2 * c + " -" + DotRadius * 2 + " 0 -" + DotRadius * 2 + " c\n\
" + DotRadius * 2 * c + " -" + DotRadius * 2 + " " + DotRadius * 2 + " -" + DotRadius * 2 * c + " " + DotRadius * 2 + " 0 c\n\
            f\n\
            Q\n\
            0 g\n\
            q\n\
            1 0 0 1 " + AcroForm.Appearance.internal.getWidth(formObject) / 2 + " " + AcroForm.Appearance.internal.getHeight(formObject) / 2 + " cm\n\
" + DotRadius + " 0 m\n\
" + DotRadius + " " + DotRadius * c + " " + DotRadius * c + " " + DotRadius + " 0 " + DotRadius + " c\n\
-" + DotRadius * c + " " + DotRadius + " -" + DotRadius + " " + DotRadius * c + " -" + DotRadius + " 0 c\n\
-" + DotRadius + " -" + DotRadius * c + " -" + DotRadius * c + " -" + DotRadius + " 0 -" + DotRadius + " c\n\
" + DotRadius * c + " -" + DotRadius + " " + DotRadius + " -" + DotRadius * c + " " + DotRadius + " 0 c\n\
            f\n\
            Q\n";
                xobj.stream = stream;
                return xobj;
            },
            OffPushDown: function (formObject) {
                var xobj = AcroForm.createFormXObject(formObject);
                var stream = "";
                var DotRadius = (AcroForm.Appearance.internal.getWidth(formObject) <= AcroForm.Appearance.internal.getHeight(formObject)) ?
                AcroForm.Appearance.internal.getWidth(formObject) / 4 : AcroForm.Appearance.internal.getHeight(formObject) / 4;
                // The Borderpadding...
                DotRadius *= 0.9;
                var c = AcroForm.Appearance.internal.Bezier_C;
                stream += "0.749023 g\n\
            q\n\
 1 0 0 1 " + AcroForm.Appearance.internal.getWidth(formObject) / 2 + " " + AcroForm.Appearance.internal.getHeight(formObject) / 2 + " cm\n\
" + DotRadius * 2 + " 0 m\n\
" + DotRadius * 2 + " " + DotRadius * 2 * c + " " + DotRadius * 2 * c + " " + DotRadius * 2 + " 0 " + DotRadius * 2 + " c\n\
-" + DotRadius * 2 * c + " " + DotRadius * 2 + " -" + DotRadius * 2 + " " + DotRadius * 2 * c + " -" + DotRadius * 2 + " 0 c\n\
-" + DotRadius * 2 + " -" + DotRadius * 2 * c + " -" + DotRadius * 2 * c + " -" + DotRadius * 2 + " 0 -" + DotRadius * 2 + " c\n\
" + DotRadius * 2 * c + " -" + DotRadius * 2 + " " + DotRadius * 2 + " -" + DotRadius * 2 * c + " " + DotRadius * 2 + " 0 c\n\
            f\n\
            Q\n";
                xobj.stream = stream;
                return xobj;
            },
        },

        Cross: {
            /**
             * Creates the Actual AppearanceDictionary-References
             * @param name
             * @returns
             */
            createAppearanceStream: function (name) {
                var appearanceStreamContent = {
                    D: {
                        'Off': AcroForm.Appearance.RadioButton.Cross.OffPushDown
                    },
                    N: {}
                };
                appearanceStreamContent.N[name] = AcroForm.Appearance.RadioButton.Cross.YesNormal;
                appearanceStreamContent.D[name] = AcroForm.Appearance.RadioButton.Cross.YesPushDown;
                return appearanceStreamContent;
            },
            createMK: function () {
                return "<< /CA (8)>>";
            },


            YesNormal: function (formObject) {
                var xobj = AcroForm.createFormXObject(formObject);
                var stream = "";
                var cross = AcroForm.Appearance.internal.calculateCross(formObject);
                stream += "q\n\
            1 1 " + (AcroForm.Appearance.internal.getWidth(formObject) - 2) + " " + (AcroForm.Appearance.internal.getHeight(formObject) - 2) + " re\n\
            W\n\
            n\n\
            " + cross.x1.x + " " + cross.x1.y + " m\n\
            " + cross.x2.x + " " + cross.x2.y + " l\n\
            " + cross.x4.x + " " + cross.x4.y + " m\n\
            " + cross.x3.x + " " + cross.x3.y + " l\n\
            s\n\
            Q\n";
                xobj.stream = stream;
                return xobj;
            },
            YesPushDown: function (formObject) {
                var xobj = AcroForm.createFormXObject(formObject);
                var cross = AcroForm.Appearance.internal.calculateCross(formObject);
                var stream = "";
                stream += "0.749023 g\n\
            0 0 " + AcroForm.Appearance.internal.getWidth(formObject) + " " + AcroForm.Appearance.internal.getHeight(formObject) + " re\n\
            f\n\
            q\n\
            1 1 " + (AcroForm.Appearance.internal.getWidth(formObject) - 2) + " " + (AcroForm.Appearance.internal.getHeight(formObject) - 2) + " re\n\
            W\n\
            n\n\
            " + cross.x1.x + " " + cross.x1.y + " m\n\
            " + cross.x2.x + " " + cross.x2.y + " l\n\
            " + cross.x4.x + " " + cross.x4.y + " m\n\
            " + cross.x3.x + " " + cross.x3.y + " l\n\
            s\n\
            Q\n";
                xobj.stream = stream;
                return xobj;
            },
            OffPushDown: function (formObject) {
                var xobj = AcroForm.createFormXObject(formObject);
                var stream = "";
                stream += "0.749023 g\n\
            0 0 " + AcroForm.Appearance.internal.getWidth(formObject) + " " + AcroForm.Appearance.internal.getHeight(formObject) + " re\n\
            f\n";
                xobj.stream = stream;
                return xobj;
            }
        },
    },

    /**
     * Returns the standard Appearance
     * @returns {AcroForm.FormXObject}
     */
    createDefaultAppearanceStream: function (formObject) {
        var stream = "";
        // Set Helvetica to Standard Font (12px)
        // Color: Black
        stream += "/Helv 12 Tf 0 g";
        return stream;
    }
};

AcroForm.Appearance.internal = {
    Bezier_C: 0.551915024494,

    calculateCross: function (formObject) {
        var min = function (x, y) {
            return (x > y) ? y : x;
        };

        var width = AcroForm.Appearance.internal.getWidth(formObject);
        var height = AcroForm.Appearance.internal.getHeight(formObject);
        var a = min(width, height);
        var crossSize = a;
        var borderPadding = 2; // The Padding in px


        var cross = {
            x1: { // upperLeft
                x: (width - a) / 2,
                y: ((height - a) / 2) + a,//height - borderPadding
            },
            x2: { // lowerRight
                x: ((width - a) / 2) + a,
                y: ((height - a) / 2)//borderPadding
            },
            x3: { // lowerLeft
                x: (width - a) / 2,
                y: ((height - a) / 2)//borderPadding
            },
            x4: { // upperRight
                x: ((width - a) / 2) + a,
                y: ((height - a) / 2) + a,//height - borderPadding
            }
        };

        return cross;
    },
};
AcroForm.Appearance.internal.getWidth = function (formObject) {
    return formObject.Rect[2];//(formObject.Rect[2] - formObject.Rect[0]) || 0;
};
AcroForm.Appearance.internal.getHeight = function (formObject) {
    return formObject.Rect[3];//(formObject.Rect[1] - formObject.Rect[3]) || 0;
};

// ##########################

//### For inheritance:
AcroForm.internal.inherit = function (child, parent) {
    var ObjectCreate = Object.create || function (o) {
            var F = function () {
            };
            F.prototype = o;
            return new F();
        };
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};

// ### Handy Functions:

AcroForm.internal.arrayToPdfArray = function (array) {
    if (Array.isArray(array)) {
        var content = ' [';
        for (var i in array) {
            var element = array[i].toString();
            content += element;
            content += ((i < array.length - 1) ? ' ' : '');
        }
        content += ']';

        return content;
    }
};

AcroForm.internal.toPdfString = function (string) {
    string = string || "";

    // put Bracket at the Beginning of the String
    if (string.indexOf('(') !== 0) {
        string = '(' + string;
    }

    if (string.substring(string.length - 1) != ')') {
        string += '(';
    }
    return string;
};

// ##########################
//          Classes
// ##########################


AcroForm.PDFObject = function () {
    // The Object ID in the PDF Object Model
    // todo
    var _objId;
    Object.defineProperty(this, 'objId', {
        get: function () {
            if (!_objId) {
                if (this.internal) {
                    _objId = this.internal.newObjectDeferred();
                } else if (jsPDF.API.acroformPlugin.internal) {
                    // todo - find better option, that doesn't rely on a Global Static var
                    _objId = jsPDF.API.acroformPlugin.internal.newObjectDeferred();
                }
            }
            if (!_objId) {
                console.log("Couldn't create Object ID");
            }
            return _objId
        },
        configurable: false
    });
};

AcroForm.PDFObject.prototype.toString = function () {
    return this.objId + " 0 R";
};

AcroForm.PDFObject.prototype.getString = function () {
    var res = this.objId + " 0 obj\n<<";
    var content = this.getContent();

    res += content + ">>\n";
    if (this.stream) {
        res += "stream\n";
        res += this.stream;
        res += "endstream\n";
    }
    res += "endobj\n";
    return res;
};

AcroForm.PDFObject.prototype.getContent = function () {
    /**
     * Prints out all enumerable Variables from the Object
     * @param fieldObject
     * @returns {string}
     */
    var createContentFromFieldObject = function (fieldObject) {
        var content = '';

        var keys = Object.keys(fieldObject).filter(function (key) {
            return (key != 'content' && key != 'appearanceStreamContent' && key.substring(0, 1) != "_");
        });

        for (var i in keys) {
            var key = keys[i];
            var value = fieldObject[key];

            /*if (key == 'Rect' && value) {
             value = AcroForm.internal.calculateCoordinates.call(jsPDF.API.acroformPlugin.internal, value);
             }*/

            if (value) {
                if (Array.isArray(value)) {
                    content += '/' + key + ' ' + AcroForm.internal.arrayToPdfArray(value) + "\n";
                } else if (value instanceof AcroForm.PDFObject) {
                    // In case it is a reference to another PDFObject, take the referennce number
                    content += '/' + key + ' ' + value.objId + " 0 R" + "\n";
                } else {
                    content += '/' + key + ' ' + value + '\n';
                }
            }
        }
        return content;
    };

    var object = "";

    object += createContentFromFieldObject(this);
    return object;
};

AcroForm.FormXObject = function () {
    AcroForm.PDFObject.call(this);
    this.Type = "/XObject";
    this.Subtype = "/Form";
    this.FormType = 1;
    this.BBox;
    this.Matrix;
    this.Resources = "2 0 R";
    this.PieceInfo;
    var _stream;
    Object.defineProperty(this, 'Length', {
        enumerable: true,
        get: function () {
            return (_stream !== undefined) ? _stream.length : 0;
        }
    });
    Object.defineProperty(this, 'stream', {
        enumerable: false,
        set: function (val) {
            _stream = val;
        },
        get: function () {
            if (_stream) {
                return _stream;
            } else {
                return null;
            }
        }
    });
};

AcroForm.internal.inherit(AcroForm.FormXObject, AcroForm.PDFObject);

AcroForm.AcroFormDictionary = function () {
    AcroForm.PDFObject.call(this);
    var _Kids = [];
    Object.defineProperty(this, 'Kids', {
        enumerable: false,
        configurable: true,
        get: function () {
            if (_Kids.length > 0) {
                return _Kids;
            } else {
                return;
            }
        }
    });
    Object.defineProperty(this, 'Fields', {
        enumerable: true,
        configurable: true,
        get: function () {
            return _Kids;
        }
    });
    // Default Appearance
    this.DA;
};

AcroForm.internal.inherit(AcroForm.AcroFormDictionary, AcroForm.PDFObject);


// ##### The Objects, the User can Create:


// The Field Object contains the Variables, that every Field needs
// Rectangle for Appearance: lower_left_X, lower_left_Y, width, height
AcroForm.Field = function () {
    'use strict';
    AcroForm.PDFObject.call(this);

    var _Rect;
    Object.defineProperty(this, 'Rect', {
        enumerable: true,
        configurable: false,
        get: function () {
            if (!_Rect) {
                return;
            }
            var tmp = _Rect;
            //var calculatedRes = AcroForm.internal.calculateCoordinates(_Rect); // do later!
            return tmp
        },
        set: function (val) {
            _Rect = val;
        }
    });

    var _FT = "";
    Object.defineProperty(this, 'FT', {
        enumerable: true,
        set: function (val) {
            _FT = val
        },
        get: function () {
            return _FT
        }
    });
    /**
     * The Partial name of the Field Object.
     * It has to be unique.
     */
    var _T;

    Object.defineProperty(this, 'T', {
        enumerable: true,
        configurable: false,
        set: function (val) {
            _T = val;
        },
        get: function () {
            if (!_T || _T.length < 1) {
                if (this instanceof AcroForm.ChildClass) {
                    // In case of a Child from a Radio´Group, you don't need a FieldName!!!
                    return;
                }
                return "(FieldObject" + (AcroForm.Field.FieldNum++) + ")";
            }
            if (_T.substring(0, 1) == "(" && _T.substring(_T.length - 1)) {
                return _T;
            }
            return "(" + _T + ")";
        }
    });

    var _DA;
    // Defines the default appearance (Needed for variable Text)
    Object.defineProperty(this, 'DA', {
        enumerable: true,
        get: function () {
            if (!_DA) {
                return;
            }
            return '(' + _DA + ')'
        },
        set: function (val) {
            _DA = val
        }
    });

    var _DV;
    // Defines the default value
    Object.defineProperty(this, 'DV', {
        enumerable: true,
        configurable: true,
        get: function () {
            if (!_DV) {
                return;
            }
            return _DV
        },
        set: function (val) {
            _DV = val
        }
    });

    //this.Type = "/Annot";
    //this.Subtype = "/Widget";
    Object.defineProperty(this, 'Type', {
        enumerable: true,
        get: function () {
            return (this.hasAnnotation) ? "/Annot" : null;
        }
    });

    Object.defineProperty(this, 'Subtype', {
        enumerable: true,
        get: function () {
            return (this.hasAnnotation) ? "/Widget" : null;
        }
    });

    /**
     *
     * @type {Array}
     */
    this.BG;

    Object.defineProperty(this, 'hasAnnotation', {
        enumerable: false,
        get: function () {
            if (this.Rect || this.BC || this.BG) {
                return true
            }
            return false;
        }
    });

    Object.defineProperty(this, 'hasAppearanceStream', {
        enumerable: false,
        configurable: true,
        writable: true
    });

    Object.defineProperty(this, 'page', {
        enumerable: false,
        configurable: true,
        writable: true
    });
};
AcroForm.Field.FieldNum = 0;

AcroForm.internal.inherit(AcroForm.Field, AcroForm.PDFObject);

AcroForm.ChoiceField = function () {
    AcroForm.Field.call(this);
    // Field Type = Choice Field
    this.FT = "/Ch";
    // options
    this.Opt = [];
    this.V = '()';
    // Top Index
    this.TI = 0;
    /**
     * Defines, whether the
     * @type {boolean}
     */
    this.combo = false;
    /**
     * Defines, whether the Choice Field is an Edit Field.
     * An Edit Field is automatically an Combo Field.
     */
    Object.defineProperty(this, 'edit', {
        enumerable: true,
        set: function (val) {
            if (val == true) {
                this._edit = true;
                // ComboBox has to be true
                this.combo = true;
            } else {
                this._edit = false;
            }
        },
        get: function () {
            if (!this._edit) {
                return false;
            }
            return this._edit;
        },
        configurable: false
    });
    this.hasAppearanceStream = true;
    Object.defineProperty(this, 'V', {
        get: function() {
            AcroForm.internal.toPdfString();
        }
    });
};
AcroForm.internal.inherit(AcroForm.ChoiceField, AcroForm.Field);
window["ChoiceField"] = AcroForm.ChoiceField;

AcroForm.ListBox = function () {
    AcroForm.ChoiceField.call(this);
    //var combo = true;
};
AcroForm.internal.inherit(AcroForm.ListBox, AcroForm.ChoiceField);
window["ListBox"] = AcroForm.ListBox;

AcroForm.ComboBox = function () {
    AcroForm.ListBox.call(this);
    this.combo = true;
};
AcroForm.internal.inherit(AcroForm.ComboBox, AcroForm.ListBox);
window["ComboBox"] = AcroForm.ComboBox;

AcroForm.EditBox = function () {
    AcroForm.ComboBox.call(this);
    this.edit = true;
};
AcroForm.internal.inherit(AcroForm.EditBox, AcroForm.ComboBox);
window["EditBox"] = AcroForm.EditBox;


AcroForm.Button = function () {
    AcroForm.Field.call(this);
    this.FT = "/Btn";
    //this.hasAnnotation = true;
};
AcroForm.internal.inherit(AcroForm.Button, AcroForm.Field);
window["Button"] = AcroForm.Button;

AcroForm.PushButton = function () {
    AcroForm.Button.call(this);
    this.pushbutton = true;
};
AcroForm.internal.inherit(AcroForm.PushButton, AcroForm.Button);
window["PushButton"] = AcroForm.PushButton;

AcroForm.RadioButton = function () {
    AcroForm.Button.call(this);
    this.radio = true;
    var _Kids = [];
    Object.defineProperty(this, 'Kids', {
        enumerable: true,
        get: function () {
            if (_Kids.length > 0) {
                return _Kids;
            }
        }
    });

    Object.defineProperty(this, '__Kids', {
        get: function () {
            return _Kids;
        }
    });

    var _noToggleToOff;

    Object.defineProperty(this, 'noToggleToOff', {
        enumerable: false,
        get: function () {
            return _noToggleToOff
        },
        set: function (val) {
            _noToggleToOff = val
        }
    });


    //this.hasAnnotation = false;
};
AcroForm.internal.inherit(AcroForm.RadioButton, AcroForm.Button);
window["RadioButton"] = AcroForm.RadioButton;

/*
 * The Child classs of a RadioButton (the radioGroup)
 * -> The single Buttons
 */
AcroForm.ChildClass = function (parent, name) {
    AcroForm.Field.call(this);
    this.Parent = parent;

    // todo: set AppearanceType as variable that can be set from the outside...
    this._AppearanceType = AcroForm.Appearance.RadioButton.Circle; // The Default appearanceType is the Circle
    this.appearanceStreamContent = this._AppearanceType.createAppearanceStream(name);

    // Set Print in the Annot Flag
    this.F = AcroForm.internal.setBitPosition(this.F, 3, 1);

    // Set AppearanceCharacteristicsDictionary with default appearance if field is not interacting with user
    this.MK = this._AppearanceType.createMK(); // (8) -> Cross, (1)-> Circle, ()-> nothing

    // Default Appearance is Off
    this.AS = "/Off";// + name;

    this._Name = name;
};
AcroForm.internal.inherit(AcroForm.ChildClass, AcroForm.Field);

AcroForm.RadioButton.prototype.setAppearance = function (appearance) {
    if (!('createAppearanceStream' in appearance && 'createMK' in appearance)) {
        console.log("Couldn't assign Appearance to RadioButton. Appearance was Invalid!");
        return;
    }
    for (var i in this.__Kids) {
        var child = this.__Kids[i];

        child.appearanceStreamContent = appearance.createAppearanceStream(child._Name);
        child.MK = appearance.createMK();
    }
};

AcroForm.RadioButton.prototype.createOption = function (name) {
    var parent = this;
    var kidCount = this.__Kids.length;

    // Create new Child for RadioGroup
    var child = new AcroForm.ChildClass(parent, name);
    // Add to Parent
    this.__Kids.push(child);

    jsPDF.API.addField(child);

    return child;
};


AcroForm.CheckBox = function () {
    Button.call(this);
    this.appearanceStreamContent = AcroForm.Appearance.CheckBox.createAppearanceStream();
    this.MK = AcroForm.Appearance.CheckBox.createMK();
    this.AS = "/On";
    this.V = "/On";
};
AcroForm.internal.inherit(AcroForm.CheckBox, AcroForm.Button);
window["CheckBox"] = AcroForm.CheckBox;

AcroForm.TextField = function () {
    AcroForm.Field.call(this);
    this.DA = AcroForm.Appearance.createDefaultAppearanceStream();
    this.F = 4;
    var _V;
    Object.defineProperty(this, 'V', {
        get: function () {
            if (_V) {
                return "(" + _V + ")"
            }
            else {
                return _V
            }
        },
        enumerable: true,
        set: function (val) {
            _V = val
        }
    });

    var _DV;
    Object.defineProperty(this, 'DV', {
        get: function () {
            if (_DV) {
                return "(" + _DV + ")"
            }
            else {
                return _DV
            }
        },
        enumerable: true,
        set: function (val) {
            _DV = val
        }
    });

    var _multiline = false;
    Object.defineProperty(this, 'multiline', {
        enumerable: false,
        get: function () {
            return _multiline
        },
        set: function (val) {
            _multiline = val;
        }
    });

    //this.multiline = false;
    //this.password = false;
    /**
     * For PDF 1.4
     * @type {boolean}
     */
    //this.fileSelect = false;
    /**
     * For PDF 1.4
     * @type {boolean}
     */
    //this.doNotSpellCheck = false;
    /**
     * For PDF 1.4
     * @type {boolean}
     */
        //this.doNotScroll = false;

    var _MaxLen = false;
    Object.defineProperty(this, 'MaxLen', {
        enumerable: true,
        get: function () {
            return _MaxLen;
        },
        set: function (val) {
            _MaxLen = val;
        }
    });

    Object.defineProperty(this, 'hasAppearanceStream', {
        enumerable: false,
        get: function () {
            return (this.V || this.DV);
        }
    });

};
AcroForm.internal.inherit(AcroForm.TextField, AcroForm.Field);
window["TextField"] = AcroForm.TextField;

AcroForm.PasswordField = function () {
    TextField.call(this);
    Object.defineProperty(this, 'password', {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false
    });
};
AcroForm.internal.inherit(AcroForm.PasswordField, AcroForm.TextField);
window["PasswordField"] = AcroForm.PasswordField;

// ############ internal functions

/*
 * small workaround for calculating the TextMetric aproximately
 * @param text
 * @param fontsize
 * @returns {TextMetrics} (Has Height and Width)
 */
AcroForm.internal.calculateFontSpace = function (text, fontsize, fonttype) {
    var fonttype = fonttype || "helvetica";
    //re-use canvas object for speed improvements
    var canvas = AcroForm.internal.calculateFontSpace.canvas || (AcroForm.internal.calculateFontSpace.canvas = document.createElement('canvas'));

    var context = canvas.getContext('2d');
    context.save();
    var newFont = (fontsize + " " + fonttype);
    context.font = newFont;
    var res = context.measureText(text);
    context.fontcolor = 'black';
    // Calculate height:
    var context = canvas.getContext('2d');
    res.height = context.measureText("3").width * 1.5; // 3 because in ZapfDingbats its a Hook and a 3 in normal fonts
    context.restore();

    var width = res.width;

    return res;
};

AcroForm.internal.calculateX = function (formObject, text, font, maxFontSize) {
    var maxFontSize = maxFontSize || 12;
    var font = font || "helvetica";
    var returnValue = {
        text: "",
        fontSize: ""
    };
    // Remove Brackets
    text = (text.substr(0, 1) == '(') ? text.substr(1) : text;
    text = (text.substr(text.length - 1) == ')') ? text.substr(0, text.length - 1) : text;
    // split into array of words
    var textSplit = text.split(' ');

    /**
     * the color could be ((alpha)||(r,g,b)||(c,m,y,k))
     * @type {string}
     */
    var color = "0 g\n";
    var fontSize = maxFontSize; // The Starting fontSize (The Maximum)
    var lineSpacing = 2;
    var borderPadding = 2;


    var height = AcroForm.Appearance.internal.getHeight(formObject) || 0;
    height = (height < 0) ? -height : height;
    var width = AcroForm.Appearance.internal.getWidth(formObject) || 0;
    width = (width < 0) ? -width : width;

    var isSmallerThanWidth = function (i, lastLine, fontSize) {
        if (i + 1 < textSplit.length) {
            var tmp = lastLine + " " + textSplit[i + 1];
            var TextWidth = ((AcroForm.internal.calculateFontSpace(tmp, fontSize + "px", font).width));
            var FieldWidth = (width - 2 * borderPadding);
            return (TextWidth <= FieldWidth);
        } else {
            return false;
        }
    };


    fontSize++;
    FontSize: while (true) {
        var text = "";
        fontSize--;
        var textHeight = AcroForm.internal.calculateFontSpace("3", fontSize + "px", font).height;
        var startY = (formObject.multiline) ? height - fontSize : (height - textHeight) / 2;
        startY += lineSpacing;
        var startX = -borderPadding;

        var lastX = startX, lastY = startY;
        var firstWordInLine = 0, lastWordInLine = 0;
        var lastLength = 0;

        var y = 0;
        if (fontSize == 0) {
            // In case, the Text doesn't fit at all
            fontSize = 12;
            text = "(...) Tj\n";
            text += "% Width of Text: " + AcroForm.internal.calculateFontSpace(text, "1px").width + ", FieldWidth:" + width + "\n";
            break;
        }

        lastLength = AcroForm.internal.calculateFontSpace(textSplit[0] + " ", fontSize + "px", font).width;

        var lastLine = "";
        var lineCount = 0;
        Line:
            for (var i in textSplit) {
                lastLine += textSplit[i] + " ";
                // Remove last blank
                lastLine = (lastLine.substr(lastLine.length - 1) == " ") ? lastLine.substr(0, lastLine.length - 1) : lastLine;
                var key = parseInt(i);
                lastLength = AcroForm.internal.calculateFontSpace(lastLine + " ", fontSize + "px", font).width;
                var nextLineIsSmaller = isSmallerThanWidth(key, lastLine, fontSize);
                var isLastWord = i >= textSplit.length - 1;
                if (nextLineIsSmaller && !isLastWord) {
                    lastLine += " ";
                    continue; // Line
                } else if (!nextLineIsSmaller && !isLastWord) {
                    if (!formObject.multiline) {
                        continue FontSize;
                    } else {
                        if (((textHeight + lineSpacing) * (lineCount + 2) + lineSpacing) > height) {
                            // If the Text is higher than the FieldObject
                            continue FontSize;
                        }
                        lastWordInLine = key;
                        // go on
                    }
                } else if (isLastWord) {
                    lastWordInLine = key;
                } else {
                    if (formObject.multiline && ((textHeight + lineSpacing) * (lineCount + 2) + lineSpacing) > height) {
                        // If the Text is higher than the FieldObject
                        continue FontSize;
                    }
                }

                var line = '';

                for (var x = firstWordInLine; x <= lastWordInLine; x++) {
                    line += textSplit[x] + ' ';
                }

                // Remove last blank
                line = (line.substr(line.length - 1) == " ") ? line.substr(0, line.length - 1) : line;
                //lastLength -= blankSpace.width;
                lastLength = AcroForm.internal.calculateFontSpace(line, fontSize + "px", font).width;

                // Calculate startX
                switch (formObject.Q) {
                    case 2: // Right justified
                        startX = (width - lastLength - borderPadding);
                        break;
                    case 1:// Q = 1 := Text-Alignment: Center
                        startX = (width - lastLength) / 2;
                        break;
                    case 0:
                    default:
                        startX = borderPadding;
                        break;
                }
                text += (startX) + ' ' + (lastY) + ' Td\n';
                text += '(' + line + ') Tj\n';
                // reset X in PDF
                text += (-startX) + ' 0 Td\n';

                // After a Line, adjust y position
                lastY = -(fontSize + lineSpacing);
                lastX = startX;

                // Reset for next iteration step
                lastLength = 0;
                firstWordInLine = lastWordInLine + 1;
                lineCount++;

                lastLine = "";
                continue Line;
            }
        break;
    }

    returnValue.text = text;
    returnValue.fontSize = fontSize;

    return returnValue;
};

AcroForm.internal.calculateAppearanceStream = function (formObject) {
    if (formObject.appearanceStreamContent) {
        // If appearanceStream is already set, use it
        return formObject.appearanceStreamContent;
    }

    if (!formObject.V && !formObject.DV) {
        return;
    }

    // else calculate it

    var stream = '';


    var text = formObject.V || formObject.DV;

    var calcRes = AcroForm.internal.calculateX(formObject, text);

    stream += '/Tx BMC\n' +
        'q\n' +
            //color + '\n' +
        '/F1 ' + calcRes.fontSize + ' Tf\n' +
            // Text Matrix
        '1 0 0 1 0 0 Tm\n';
    // Begin Text
    stream += 'BT\n';
    stream += calcRes.text;
    // End Text
    stream += 'ET\n';
    stream += 'Q\n' +
        'EMC\n';


    var appearanceStreamContent = new AcroForm.createFormXObject(formObject);

    appearanceStreamContent.stream = stream;


    var appearance = {
        N: {
            'Normal': appearanceStreamContent
        }
    };

    return appearanceStreamContent;
};

/*
 * Converts the Parameters from x,y,w,h to lowerLeftX, lowerLeftY, upperRightX, upperRightY
 * @param x
 * @param y
 * @param w
 * @param h
 * @returns {*[]}
 */
AcroForm.internal.calculateCoordinates = function (x, y, w, h) {
    var coordinates = {};

    if (this.internal) {
        function mmtopx(x) {
            return (x * this.internal.scaleFactor);
        }

        if (Array.isArray(x)) {
            x[0] = AcroForm.scale(x[0]);
            x[1] = AcroForm.scale(x[1]);
            x[2] = AcroForm.scale(x[2]);
            x[3] = AcroForm.scale(x[3]);

            coordinates.lowerLeft_X = x[0] || 0;
            coordinates.lowerLeft_Y = (mmtopx.call(this, this.internal.pageSize.height) - x[3] - x[1]) || 0;
            coordinates.upperRight_X = x[0] + x[2] || 0;
            coordinates.upperRight_Y = (mmtopx.call(this, this.internal.pageSize.height) - x[1]) || 0;
        } else {
            x = AcroForm.scale(x);
            y = AcroForm.scale(y);
            w = AcroForm.scale(w);
            h = AcroForm.scale(h);
            coordinates.lowerLeft_X = x || 0;
            coordinates.lowerLeft_Y = this.internal.pageSize.height - y || 0;
            coordinates.upperRight_X = x + w || 0;
            coordinates.upperRight_Y = this.internal.pageSize.height - y + h || 0;
        }
    } else {
        // old method, that is fallback, if we can't get the pageheight, the coordinate-system starts from lower left
        if (Array.isArray(x)) {
            coordinates.lowerLeft_X = x[0] || 0;
            coordinates.lowerLeft_Y = x[1] || 0;
            coordinates.upperRight_X = x[0] + x[2] || 0;
            coordinates.upperRight_Y = x[1] + x[3] || 0;
        } else {
            coordinates.lowerLeft_X = x || 0;
            coordinates.lowerLeft_Y = y || 0;
            coordinates.upperRight_X = x + w || 0;
            coordinates.upperRight_Y = y + h || 0;
        }
    }

    return [coordinates.lowerLeft_X, coordinates.lowerLeft_Y, coordinates.upperRight_X, coordinates.upperRight_Y];
};

AcroForm.internal.calculateColor = function (r, g, b) {
    var color = new Array(3);
    color.r = r | 0;
    color.g = g | 0;
    color.b = b | 0;
    return color;
};

AcroForm.internal.getBitPosition = function (variable, position) {
    variable = variable || 0;
    var bitMask = 1;
    bitMask = bitMask << (position - 1);
    return variable | bitMask;
};

AcroForm.internal.setBitPosition = function (variable, position, value) {
    variable = variable || 0;
    value = value || 1;

    var bitMask = 1;
    bitMask = bitMask << (position - 1);

    if (value == 1) {
        // Set the Bit to 1
        var variable = variable | bitMask;
    } else {
        // Set the Bit to 0
        var variable = variable & (~bitMask);
    }

    return variable;
};





/** @preserve
 * jsPDF fromHTML plugin. BETA stage. API subject to change. Needs browser
 * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
 *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 *               2014 Diego Casorran, https://github.com/diegocr
 *               2014 Daniel Husar, https://github.com/danielhusar
 *               2014 Wolfgang Gassler, https://github.com/woolfg
 *               2014 Steven Spungin, https://github.com/flamenco
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

(function (jsPDFAPI) {
	var clone,
	DrillForContent,
	FontNameDB,
	FontStyleMap,
	TextAlignMap,
	FontWeightMap,
	FloatMap,
	ClearMap,
	GetCSS,
	PurgeWhiteSpace,
	Renderer,
	ResolveFont,
	ResolveUnitedNumber,
	UnitedNumberMap,
	elementHandledElsewhere,
	images,
	loadImgs,
	checkForFooter,
	process,
	tableToJson;
	clone = (function () {
		return function (obj) {
			Clone.prototype = obj;
			return new Clone()
		};
		function Clone() {}
	})();
	PurgeWhiteSpace = function (array) {
		var fragment,
		i,
		l,
		lTrimmed,
		r,
		rTrimmed,
		trailingSpace;
		i = 0;
		l = array.length;
		fragment = void 0;
		lTrimmed = false;
		rTrimmed = false;
		while (!lTrimmed && i !== l) {
			fragment = array[i] = array[i].trimLeft();
			if (fragment) {
				lTrimmed = true;
			}
			i++;
		}
		i = l - 1;
		while (l && !rTrimmed && i !== -1) {
			fragment = array[i] = array[i].trimRight();
			if (fragment) {
				rTrimmed = true;
			}
			i--;
		}
		r = /\s+$/g;
		trailingSpace = true;
		i = 0;
		while (i !== l) {
			// Leave the line breaks intact
			if (array[i] != "\u2028") {
				fragment = array[i].replace(/\s+/g, " ");
				if (trailingSpace) {
					fragment = fragment.trimLeft();
				}
				if (fragment) {
					trailingSpace = r.test(fragment);
				}
				array[i] = fragment;
			}
			i++;
		}
		return array;
	};
	Renderer = function (pdf, x, y, settings) {
		this.pdf = pdf;
		this.x = x;
		this.y = y;
		this.settings = settings;
		//list of functions which are called after each element-rendering process
		this.watchFunctions = [];
		this.init();
		return this;
	};
	ResolveFont = function (css_font_family_string) {
		var name,
		part,
		parts;
		name = void 0;
		parts = css_font_family_string.split(",");
		part = parts.shift();
		while (!name && part) {
			name = FontNameDB[part.trim().toLowerCase()];
			part = parts.shift();
		}
		return name;
	};
	ResolveUnitedNumber = function (css_line_height_string) {

		//IE8 issues
		css_line_height_string = css_line_height_string === "auto" ? "0px" : css_line_height_string;
		if (css_line_height_string.indexOf("em") > -1 && !isNaN(Number(css_line_height_string.replace("em", "")))) {
			css_line_height_string = Number(css_line_height_string.replace("em", "")) * 18.719 + "px";
		}
		if (css_line_height_string.indexOf("pt") > -1 && !isNaN(Number(css_line_height_string.replace("pt", "")))) {
			css_line_height_string = Number(css_line_height_string.replace("pt", "")) * 1.333 + "px";
		}

		var normal,
		undef,
		value;
		undef = void 0;
		normal = 16.00;
		value = UnitedNumberMap[css_line_height_string];
		if (value) {
			return value;
		}
		value = {
			"xx-small"  :  9,
			"x-small"   : 11,
			small       : 13,
			medium      : 16,
			large       : 19,
			"x-large"   : 23,
			"xx-large"  : 28,
			auto        :  0
		}[{ css_line_height_string : css_line_height_string }];

		if (value !== undef) {
			return UnitedNumberMap[css_line_height_string] = value / normal;
		}
		if (value = parseFloat(css_line_height_string)) {
			return UnitedNumberMap[css_line_height_string] = value / normal;
		}
		value = css_line_height_string.match(/([\d\.]+)(px)/);
		if (value.length === 3) {
			return UnitedNumberMap[css_line_height_string] = parseFloat(value[1]) / normal;
		}
		return UnitedNumberMap[css_line_height_string] = 1;
	};
	GetCSS = function (element) {
		var css,tmp,computedCSSElement;
		computedCSSElement = (function (el) {
			var compCSS;
			compCSS = (function (el) {
				if (document.defaultView && document.defaultView.getComputedStyle) {
					return document.defaultView.getComputedStyle(el, null);
				} else if (el.currentStyle) {
					return el.currentStyle;
				} else {
					return el.style;
				}
			})(el);
			return function (prop) {
				prop = prop.replace(/-\D/g, function (match) {
					return match.charAt(1).toUpperCase();
				});
				return compCSS[prop];
			};
		})(element);
		css = {};
		tmp = void 0;
		css["font-family"] = ResolveFont(computedCSSElement("font-family")) || "times";
		css["font-style"] = FontStyleMap[computedCSSElement("font-style")] || "normal";
		css["text-align"] = TextAlignMap[computedCSSElement("text-align")] || "left";
		tmp = FontWeightMap[computedCSSElement("font-weight")] || "normal";
		if (tmp === "bold") {
			if (css["font-style"] === "normal") {
				css["font-style"] = tmp;
			} else {
				css["font-style"] = tmp + css["font-style"];
			}
		}
		css["font-size"] = ResolveUnitedNumber(computedCSSElement("font-size")) || 1;
		css["line-height"] = ResolveUnitedNumber(computedCSSElement("line-height")) || 1;
		css["display"] = (computedCSSElement("display") === "inline" ? "inline" : "block");

		tmp = (css["display"] === "block");
		css["margin-top"]     = tmp && ResolveUnitedNumber(computedCSSElement("margin-top"))     || 0;
		css["margin-bottom"]  = tmp && ResolveUnitedNumber(computedCSSElement("margin-bottom"))  || 0;
		css["padding-top"]    = tmp && ResolveUnitedNumber(computedCSSElement("padding-top"))    || 0;
		css["padding-bottom"] = tmp && ResolveUnitedNumber(computedCSSElement("padding-bottom")) || 0;
		css["margin-left"]    = tmp && ResolveUnitedNumber(computedCSSElement("margin-left"))    || 0;
		css["margin-right"]   = tmp && ResolveUnitedNumber(computedCSSElement("margin-right"))   || 0;
		css["padding-left"]   = tmp && ResolveUnitedNumber(computedCSSElement("padding-left"))   || 0;
		css["padding-right"]  = tmp && ResolveUnitedNumber(computedCSSElement("padding-right"))  || 0;

		css["page-break-before"] = computedCSSElement("page-break-before") || "auto";

		//float and clearing of floats
		css["float"] = FloatMap[computedCSSElement("cssFloat")] || "none";
		css["clear"] = ClearMap[computedCSSElement("clear")] || "none";

		css["color"]  = computedCSSElement("color");

		return css;
	};
	elementHandledElsewhere = function (element, renderer, elementHandlers) {
		var handlers,
		i,
		isHandledElsewhere,
		l,
		t;
		isHandledElsewhere = false;
		i = void 0;
		l = void 0;
		t = void 0;
		handlers = elementHandlers["#" + element.id];
		if (handlers) {
			if (typeof handlers === "function") {
				isHandledElsewhere = handlers(element, renderer);
			} else {
				i = 0;
				l = handlers.length;
				while (!isHandledElsewhere && i !== l) {
					isHandledElsewhere = handlers[i](element, renderer);
					i++;
				}
			}
		}
		handlers = elementHandlers[element.nodeName];
		if (!isHandledElsewhere && handlers) {
			if (typeof handlers === "function") {
				isHandledElsewhere = handlers(element, renderer);
			} else {
				i = 0;
				l = handlers.length;
				while (!isHandledElsewhere && i !== l) {
					isHandledElsewhere = handlers[i](element, renderer);
					i++;
				}
			}
		}
		return isHandledElsewhere;
	};
	tableToJson = function (table, renderer) {
		var data,
		headers,
		i,
		j,
		rowData,
		tableRow,
		table_obj,
		table_with,
		cell,
		l;
		data = [];
		headers = [];
		i = 0;
		l = table.rows[0].cells.length;
		table_with = table.clientWidth;
		while (i < l) {
			cell = table.rows[0].cells[i];
			headers[i] = {
				name : cell.textContent.toLowerCase().replace(/\s+/g, ''),
				prompt : cell.textContent.replace(/\r?\n/g, ''),
				width : (cell.clientWidth / table_with) * renderer.pdf.internal.pageSize.width
			};
			i++;
		}
		i = 1;
		while (i < table.rows.length) {
			tableRow = table.rows[i];
			rowData = {};
			j = 0;
			while (j < tableRow.cells.length) {
				rowData[headers[j].name] = tableRow.cells[j].textContent.replace(/\r?\n/g, '');
				j++;
			}
			data.push(rowData);
			i++;
		}
		return table_obj = {
			rows : data,
			headers : headers
		};
	};
	var SkipNode = {
		SCRIPT   : 1,
		STYLE    : 1,
		NOSCRIPT : 1,
		OBJECT   : 1,
		EMBED    : 1,
		SELECT   : 1
	};
	var listCount = 1;
	DrillForContent = function (element, renderer, elementHandlers) {
		var cn,
		cns,
		fragmentCSS,
		i,
		isBlock,
		l,
		px2pt,
		table2json,
		cb;
		cns = element.childNodes;
		cn = void 0;
		fragmentCSS = GetCSS(element);
		isBlock = fragmentCSS.display === "block";
		if (isBlock) {
			renderer.setBlockBoundary();
			renderer.setBlockStyle(fragmentCSS);
		}
		px2pt = 0.264583 * 72 / 25.4;
		i = 0;
		l = cns.length;
		while (i < l) {
			cn = cns[i];
			if (typeof cn === "object") {

				//execute all watcher functions to e.g. reset floating
				renderer.executeWatchFunctions(cn);

				/*** HEADER rendering **/
				if (cn.nodeType === 1 && cn.nodeName === 'HEADER') {
					var header = cn;
					//store old top margin
					var oldMarginTop = renderer.pdf.margins_doc.top;
					//subscribe for new page event and render header first on every page
					renderer.pdf.internal.events.subscribe('addPage', function (pageInfo) {
						//set current y position to old margin
						renderer.y = oldMarginTop;
						//render all child nodes of the header element
						DrillForContent(header, renderer, elementHandlers);
						//set margin to old margin + rendered header + 10 space to prevent overlapping
						//important for other plugins (e.g. table) to start rendering at correct position after header
						renderer.pdf.margins_doc.top = renderer.y + 10;
						renderer.y += 10;
					}, false);
				}

				if (cn.nodeType === 8 && cn.nodeName === "#comment") {
					if (~cn.textContent.indexOf("ADD_PAGE")) {
						renderer.pdf.addPage();
						renderer.y = renderer.pdf.margins_doc.top;
					}

				} else if (cn.nodeType === 1 && !SkipNode[cn.nodeName]) {
					/*** IMAGE RENDERING ***/
					var cached_image;
					if (cn.nodeName === "IMG") {
						var url = cn.getAttribute("src");
						cached_image = images[renderer.pdf.sHashCode(url) || url];
					}
					if (cached_image) {
						if ((renderer.pdf.internal.pageSize.height - renderer.pdf.margins_doc.bottom < renderer.y + cn.height) && (renderer.y > renderer.pdf.margins_doc.top)) {
							renderer.pdf.addPage();
							renderer.y = renderer.pdf.margins_doc.top;
							//check if we have to set back some values due to e.g. header rendering for new page
							renderer.executeWatchFunctions(cn);
						}

						var imagesCSS = GetCSS(cn);
						var imageX = renderer.x;
						var fontToUnitRatio = 12 / renderer.pdf.internal.scaleFactor;

						//define additional paddings, margins which have to be taken into account for margin calculations
						var additionalSpaceLeft = (imagesCSS["margin-left"] + imagesCSS["padding-left"])*fontToUnitRatio;
						var additionalSpaceRight = (imagesCSS["margin-right"] + imagesCSS["padding-right"])*fontToUnitRatio;
						var additionalSpaceTop = (imagesCSS["margin-top"] + imagesCSS["padding-top"])*fontToUnitRatio;
						var additionalSpaceBottom = (imagesCSS["margin-bottom"] + imagesCSS["padding-bottom"])*fontToUnitRatio;

						//if float is set to right, move the image to the right border
						//add space if margin is set
						if (imagesCSS['float'] !== undefined && imagesCSS['float'] === 'right') {
							imageX += renderer.settings.width - cn.width - additionalSpaceRight;
						} else {
							imageX +=  additionalSpaceLeft;
						}

						renderer.pdf.addImage(cached_image, imageX, renderer.y + additionalSpaceTop, cn.width, cn.height);
						cached_image = undefined;
						//if the float prop is specified we have to float the text around the image
						if (imagesCSS['float'] === 'right' || imagesCSS['float'] === 'left') {
							//add functiont to set back coordinates after image rendering
							renderer.watchFunctions.push((function(diffX , thresholdY, diffWidth, el) {
								//undo drawing box adaptions which were set by floating
								if (renderer.y >= thresholdY) {
									renderer.x += diffX;
									renderer.settings.width += diffWidth;
									return true;
								} else if(el && el.nodeType === 1 && !SkipNode[el.nodeName] && renderer.x+el.width > (renderer.pdf.margins_doc.left + renderer.pdf.margins_doc.width)) {
									renderer.x += diffX;
									renderer.y = thresholdY;
									renderer.settings.width += diffWidth;
									return true;
								} else {
									return false;
								}
							}).bind(this, (imagesCSS['float'] === 'left') ? -cn.width-additionalSpaceLeft-additionalSpaceRight : 0, renderer.y+cn.height+additionalSpaceTop+additionalSpaceBottom, cn.width));
							//reset floating by clear:both divs
							//just set cursorY after the floating element
							renderer.watchFunctions.push((function(yPositionAfterFloating, pages, el) {
								if (renderer.y < yPositionAfterFloating && pages === renderer.pdf.internal.getNumberOfPages()) {
									if (el.nodeType === 1 && GetCSS(el).clear === 'both') {
										renderer.y = yPositionAfterFloating;
										return true;
									} else {
										return false;
									}
								} else {
									return true;
								}
							}).bind(this, renderer.y+cn.height, renderer.pdf.internal.getNumberOfPages()));

							//if floating is set we decrease the available width by the image width
							renderer.settings.width -= cn.width+additionalSpaceLeft+additionalSpaceRight;
							//if left just add the image width to the X coordinate
							if (imagesCSS['float'] === 'left') {
								renderer.x += cn.width+additionalSpaceLeft+additionalSpaceRight;
							}
						} else {
						//if no floating is set, move the rendering cursor after the image height
							renderer.y += cn.height + additionalSpaceTop + additionalSpaceBottom;
						}

					/*** TABLE RENDERING ***/
					} else if (cn.nodeName === "TABLE") {
						table2json = tableToJson(cn, renderer);
						renderer.y += 10;
						renderer.pdf.table(renderer.x, renderer.y, table2json.rows, table2json.headers, {
							autoSize : false,
							printHeaders: elementHandlers.printHeaders,
							margins: renderer.pdf.margins_doc,
							css: GetCSS(cn)
						});
						renderer.y = renderer.pdf.lastCellPos.y + renderer.pdf.lastCellPos.h + 20;
					} else if (cn.nodeName === "OL" || cn.nodeName === "UL") {
						listCount = 1;
						if (!elementHandledElsewhere(cn, renderer, elementHandlers)) {
							DrillForContent(cn, renderer, elementHandlers);
						}
						renderer.y += 10;
					} else if (cn.nodeName === "LI") {
						var temp = renderer.x;
						renderer.x += 20 / renderer.pdf.internal.scaleFactor;
						renderer.y += 3;
						if (!elementHandledElsewhere(cn, renderer, elementHandlers)) {
							DrillForContent(cn, renderer, elementHandlers);
						}
						renderer.x = temp;
					} else if (cn.nodeName === "BR") {
						renderer.y += fragmentCSS["font-size"] * renderer.pdf.internal.scaleFactor;
						renderer.addText("\u2028", clone(fragmentCSS));
					} else {
						if (!elementHandledElsewhere(cn, renderer, elementHandlers)) {
							DrillForContent(cn, renderer, elementHandlers);
						}
					}
				} else if (cn.nodeType === 3) {
					var value = cn.nodeValue;
					if (cn.nodeValue && cn.parentNode.nodeName === "LI") {
						if (cn.parentNode.parentNode.nodeName === "OL") {
							value = listCount++ + '. ' + value;
						} else {
							var fontSize = fragmentCSS["font-size"];
							offsetX = (3 - fontSize * 0.75) * renderer.pdf.internal.scaleFactor;
							offsetY = fontSize * 0.75 * renderer.pdf.internal.scaleFactor;
							radius = fontSize * 1.74 / renderer.pdf.internal.scaleFactor;
							cb = function (x, y) {
								this.pdf.circle(x + offsetX, y + offsetY, radius, 'FD');
							};
						}
					}
					// Only add the text if the text node is in the body element
					if (cn.ownerDocument.body.contains(cn)){
						renderer.addText(value, fragmentCSS);
					}
				} else if (typeof cn === "string") {
					renderer.addText(cn, fragmentCSS);
				}
			}
			i++;
		}
		elementHandlers.outY = renderer.y;

		if (isBlock) {
			return renderer.setBlockBoundary(cb);
		}
	};
	images = {};
	loadImgs = function (element, renderer, elementHandlers, cb) {
		var imgs = element.getElementsByTagName('img'),
		l = imgs.length, found_images,
		x = 0;
		function done() {
			renderer.pdf.internal.events.publish('imagesLoaded');
			cb(found_images);
		}
		function loadImage(url, width, height) {
			if (!url)
				return;
			var img = new Image();
			found_images = ++x;
			img.crossOrigin = '';
			img.onerror = img.onload = function () {
				if(img.complete) {
					//to support data urls in images, set width and height
					//as those values are not recognized automatically
					if (img.src.indexOf('data:image/') === 0) {
						img.width = width || img.width || 0;
						img.height = height || img.height || 0;
					}
					//if valid image add to known images array
					if (img.width + img.height) {
						var hash = renderer.pdf.sHashCode(url) || url;
						images[hash] = images[hash] || img;
					}
				}
				if(!--x) {
					done();
				}
			};
			img.src = url;
		}
		while (l--)
			loadImage(imgs[l].getAttribute("src"),imgs[l].width,imgs[l].height);
		return x || done();
	};
	checkForFooter = function (elem, renderer, elementHandlers) {
		//check if we can found a <footer> element
		var footer = elem.getElementsByTagName("footer");
		if (footer.length > 0) {

			footer = footer[0];

			//bad hack to get height of footer
			//creat dummy out and check new y after fake rendering
			var oldOut = renderer.pdf.internal.write;
			var oldY = renderer.y;
			renderer.pdf.internal.write = function () {};
			DrillForContent(footer, renderer, elementHandlers);
			var footerHeight = Math.ceil(renderer.y - oldY) + 5;
			renderer.y = oldY;
			renderer.pdf.internal.write = oldOut;

			//add 20% to prevent overlapping
			renderer.pdf.margins_doc.bottom += footerHeight;

			//Create function render header on every page
			var renderFooter = function (pageInfo) {
				var pageNumber = pageInfo !== undefined ? pageInfo.pageNumber : 1;
				//set current y position to old margin
				var oldPosition = renderer.y;
				//render all child nodes of the header element
				renderer.y = renderer.pdf.internal.pageSize.height - renderer.pdf.margins_doc.bottom;
				renderer.pdf.margins_doc.bottom -= footerHeight;

				//check if we have to add page numbers
				var spans = footer.getElementsByTagName('span');
				for (var i = 0; i < spans.length; ++i) {
					//if we find some span element with class pageCounter, set the page
					if ((" " + spans[i].className + " ").replace(/[\n\t]/g, " ").indexOf(" pageCounter ") > -1) {
						spans[i].innerHTML = pageNumber;
					}
					//if we find some span element with class totalPages, set a variable which is replaced after rendering of all pages
					if ((" " + spans[i].className + " ").replace(/[\n\t]/g, " ").indexOf(" totalPages ") > -1) {
						spans[i].innerHTML = '###jsPDFVarTotalPages###';
					}
				}

				//render footer content
				DrillForContent(footer, renderer, elementHandlers);
				//set bottom margin to previous height including the footer height
				renderer.pdf.margins_doc.bottom += footerHeight;
				//important for other plugins (e.g. table) to start rendering at correct position after header
				renderer.y = oldPosition;
			};

			//check if footer contains totalPages which shoudl be replace at the disoposal of the document
			var spans = footer.getElementsByTagName('span');
			for (var i = 0; i < spans.length; ++i) {
				if ((" " + spans[i].className + " ").replace(/[\n\t]/g, " ").indexOf(" totalPages ") > -1) {
					renderer.pdf.internal.events.subscribe('htmlRenderingFinished', renderer.pdf.putTotalPages.bind(renderer.pdf, '###jsPDFVarTotalPages###'), true);
				}
			}

			//register event to render footer on every new page
			renderer.pdf.internal.events.subscribe('addPage', renderFooter, false);
			//render footer on first page
			renderFooter();

			//prevent footer rendering
			SkipNode['FOOTER'] = 1;
		}
	};
	process = function (pdf, element, x, y, settings, callback) {
		if (!element)
			return false;
		if (typeof element !== "string" && !element.parentNode)
			element = '' + element.innerHTML;
		if (typeof element === "string") {
			element = (function (element) {
				var $frame,
				$hiddendiv,
				framename,
				visuallyhidden;
				framename = "jsPDFhtmlText" + Date.now().toString() + (Math.random() * 1000).toFixed(0);
				visuallyhidden = "position: absolute !important;" + "clip: rect(1px 1px 1px 1px); /* IE6, IE7 */" + "clip: rect(1px, 1px, 1px, 1px);" + "padding:0 !important;" + "border:0 !important;" + "height: 1px !important;" + "width: 1px !important; " + "top:auto;" + "left:-100px;" + "overflow: hidden;";
				$hiddendiv = document.createElement('div');
				$hiddendiv.style.cssText = visuallyhidden;
				$hiddendiv.innerHTML = "<iframe style=\"height:1px;width:1px\" name=\"" + framename + "\" />";
				document.body.appendChild($hiddendiv);
				$frame = window.frames[framename];
				$frame.document.open();
				$frame.document.writeln(element);
				$frame.document.close();
				return $frame.document.body;
			})(element.replace(/<\/?script[^>]*?>/gi, ''));
		}
		var r = new Renderer(pdf, x, y, settings), out;

		// 1. load images
		// 2. prepare optional footer elements
		// 3. render content
		loadImgs.call(this, element, r, settings.elementHandlers, function (found_images) {
			checkForFooter( element, r, settings.elementHandlers);
			DrillForContent(element, r, settings.elementHandlers);
			//send event dispose for final taks (e.g. footer totalpage replacement)
			r.pdf.internal.events.publish('htmlRenderingFinished');
			out = r.dispose();
			if (typeof callback === 'function') callback(out);
			else if (found_images) console.error('jsPDF Warning: rendering issues? provide a callback to fromHTML!');
		});
		return out || {x: r.x, y:r.y};
	};
	Renderer.prototype.init = function () {
		this.paragraph = {
			text : [],
			style : []
		};
		return this.pdf.internal.write("q");
	};
	Renderer.prototype.dispose = function () {
		this.pdf.internal.write("Q");
		return {
			x : this.x,
			y : this.y,
			ready:true
		};
	};

	//Checks if we have to execute some watcher functions
	//e.g. to end text floating around an image
	Renderer.prototype.executeWatchFunctions = function(el) {
		var ret = false;
		var narray = [];
		if (this.watchFunctions.length > 0) {
			for(var i=0; i< this.watchFunctions.length; ++i) {
				if (this.watchFunctions[i](el) === true) {
					ret = true;
				} else {
					narray.push(this.watchFunctions[i]);
				}
			}
			this.watchFunctions = narray;
		}
		return ret;
	};

	Renderer.prototype.splitFragmentsIntoLines = function (fragments, styles) {
		var currentLineLength,
		defaultFontSize,
		ff,
		fontMetrics,
		fontMetricsCache,
		fragment,
		fragmentChopped,
		fragmentLength,
		fragmentSpecificMetrics,
		fs,
		k,
		line,
		lines,
		maxLineLength,
		style;
		defaultFontSize = 12;
		k = this.pdf.internal.scaleFactor;
		fontMetricsCache = {};
		ff = void 0;
		fs = void 0;
		fontMetrics = void 0;
		fragment = void 0;
		style = void 0;
		fragmentSpecificMetrics = void 0;
		fragmentLength = void 0;
		fragmentChopped = void 0;
		line = [];
		lines = [line];
		currentLineLength = 0;
		maxLineLength = this.settings.width;
		while (fragments.length) {
			fragment = fragments.shift();
			style = styles.shift();
			if (fragment) {
				ff = style["font-family"];
				fs = style["font-style"];
				fontMetrics = fontMetricsCache[ff + fs];
				if (!fontMetrics) {
					fontMetrics = this.pdf.internal.getFont(ff, fs).metadata.Unicode;
					fontMetricsCache[ff + fs] = fontMetrics;
				}
				fragmentSpecificMetrics = {
					widths : fontMetrics.widths,
					kerning : fontMetrics.kerning,
					fontSize : style["font-size"] * defaultFontSize,
					textIndent : currentLineLength
				};
				fragmentLength = this.pdf.getStringUnitWidth(fragment, fragmentSpecificMetrics) * fragmentSpecificMetrics.fontSize / k;
				if (fragment == "\u2028") {
					line = [];
					lines.push(line);
				} else if (currentLineLength + fragmentLength > maxLineLength) {
					fragmentChopped = this.pdf.splitTextToSize(fragment, maxLineLength, fragmentSpecificMetrics);
					line.push([fragmentChopped.shift(), style]);
					while (fragmentChopped.length) {
						line = [[fragmentChopped.shift(), style]];
						lines.push(line);
					}
					currentLineLength = this.pdf.getStringUnitWidth(line[0][0], fragmentSpecificMetrics) * fragmentSpecificMetrics.fontSize / k;
				} else {
					line.push([fragment, style]);
					currentLineLength += fragmentLength;
				}
			}
		}

		//if text alignment was set, set margin/indent of each line
		if (style['text-align'] !== undefined && (style['text-align'] === 'center' || style['text-align'] === 'right' || style['text-align'] === 'justify')) {
			for (var i = 0; i < lines.length; ++i) {
				var length = this.pdf.getStringUnitWidth(lines[i][0][0], fragmentSpecificMetrics) * fragmentSpecificMetrics.fontSize / k;
				//if there is more than on line we have to clone the style object as all lines hold a reference on this object
				if (i > 0) {
					lines[i][0][1] = clone(lines[i][0][1]);
				}
				var space = (maxLineLength - length);

				if (style['text-align'] === 'right') {
					lines[i][0][1]['margin-left'] = space;
					//if alignment is not right, it has to be center so split the space to the left and the right
				} else if (style['text-align'] === 'center') {
					lines[i][0][1]['margin-left'] = space / 2;
					//if justify was set, calculate the word spacing and define in by using the css property
				} else if (style['text-align'] === 'justify') {
					var countSpaces = lines[i][0][0].split(' ').length - 1;
					lines[i][0][1]['word-spacing'] = space / countSpaces;
					//ignore the last line in justify mode
					if (i === (lines.length - 1)) {
						lines[i][0][1]['word-spacing'] = 0;
					}
				}
			}
		}

		return lines;
	};
	Renderer.prototype.RenderTextFragment = function (text, style) {
		var defaultFontSize,
		font,
		maxLineHeight;

		maxLineHeight = 0;
		defaultFontSize = 12;

		if (this.pdf.internal.pageSize.height - this.pdf.margins_doc.bottom < this.y + this.pdf.internal.getFontSize()) {
			this.pdf.internal.write("ET", "Q");
			this.pdf.addPage();
			this.y = this.pdf.margins_doc.top;
			this.pdf.internal.write("q", "BT 0 g", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), style.color, "Td");
			//move cursor by one line on new page
			maxLineHeight = Math.max(maxLineHeight, style["line-height"], style["font-size"]);
			this.pdf.internal.write(0, (-1 * defaultFontSize * maxLineHeight).toFixed(2), "Td");
		}

		font = this.pdf.internal.getFont(style["font-family"], style["font-style"]);

		// text color
		var pdfTextColor = this.getPdfColor(style["color"]);
		if (pdfTextColor !== this.lastTextColor)
		{
			this.pdf.internal.write(pdfTextColor);
			this.lastTextColor = pdfTextColor;
		}

		//set the word spacing for e.g. justify style
		if (style['word-spacing'] !== undefined && style['word-spacing'] > 0) {
			this.pdf.internal.write(style['word-spacing'].toFixed(2), "Tw");
		}

		this.pdf.internal.write("/" + font.id, (defaultFontSize * style["font-size"]).toFixed(2), "Tf", "(" + this.pdf.internal.pdfEscape(text) + ") Tj");


		//set the word spacing back to neutral => 0
		if (style['word-spacing'] !== undefined) {
			this.pdf.internal.write(0, "Tw");
		}
	};

	// Accepts #FFFFFF, rgb(int,int,int), or CSS Color Name
	Renderer.prototype.getPdfColor = function(style) {
		var textColor;
		var r,g,b;

		var rx = /rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+\s*)\)/;
		var m = rx.exec(style);
		if (m != null){
			r = parseInt(m[1]);
			g = parseInt(m[2]);
			b = parseInt(m[3]);
		}
		else{
			if (style.charAt(0) != '#') {
				style = CssColors.colorNameToHex(style);
				if (!style) {
					style = '#000000';
				}
			}
			r = style.substring(1, 3);
			r = parseInt(r, 16);
			g = style.substring(3, 5);
			g = parseInt(g, 16);
			b = style.substring(5, 7);
			b = parseInt(b, 16);
		}

		if ((typeof r === 'string') && /^#[0-9A-Fa-f]{6}$/.test(r)) {
			var hex = parseInt(r.substr(1), 16);
			r = (hex >> 16) & 255;
			g = (hex >> 8) & 255;
			b = (hex & 255);
		}

		var f3 = this.f3;
		if ((r === 0 && g === 0 && b === 0) || (typeof g === 'undefined')) {
			textColor = f3(r / 255) + ' g';
		} else {
			textColor = [f3(r / 255), f3(g / 255), f3(b / 255), 'rg'].join(' ');
		}
		return textColor;
	};

	Renderer.prototype.f3 = function(number) {
		return number.toFixed(3); // Ie, %.3f
	},


	Renderer.prototype.renderParagraph = function (cb) {
		var blockstyle,
		defaultFontSize,
		fontToUnitRatio,
		fragments,
		i,
		l,
		line,
		lines,
		maxLineHeight,
		out,
		paragraphspacing_after,
		paragraphspacing_before,
		priorblockstyle,
		styles,
		fontSize;
		fragments = PurgeWhiteSpace(this.paragraph.text);
		styles = this.paragraph.style;
		blockstyle = this.paragraph.blockstyle;
		priorblockstyle = this.paragraph.priorblockstyle || {};
		this.paragraph = {
			text : [],
			style : [],
			blockstyle : {},
			priorblockstyle : blockstyle
		};
		if (!fragments.join("").trim()) {
			return;
		}
		lines = this.splitFragmentsIntoLines(fragments, styles);
		line = void 0;
		maxLineHeight = void 0;
		defaultFontSize = 12;
		fontToUnitRatio = defaultFontSize / this.pdf.internal.scaleFactor;
		this.priorMarginBottom =  this.priorMarginBottom || 0;
		paragraphspacing_before = (Math.max((blockstyle["margin-top"] || 0) - this.priorMarginBottom, 0) + (blockstyle["padding-top"] || 0)) * fontToUnitRatio;
		paragraphspacing_after = ((blockstyle["margin-bottom"] || 0) + (blockstyle["padding-bottom"] || 0)) * fontToUnitRatio;
		this.priorMarginBottom =  blockstyle["margin-bottom"] || 0;

		if (blockstyle['page-break-before'] === 'always'){
			this.pdf.addPage();
			this.y = 0;
			paragraphspacing_before = ((blockstyle["margin-top"] || 0) + (blockstyle["padding-top"] || 0)) * fontToUnitRatio;
		}

		out = this.pdf.internal.write;
		i = void 0;
		l = void 0;
		this.y += paragraphspacing_before;
		out("q", "BT 0 g", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");

		//stores the current indent of cursor position
		var currentIndent = 0;

		while (lines.length) {
			line = lines.shift();
			maxLineHeight = 0;
			i = 0;
			l = line.length;
			while (i !== l) {
				if (line[i][0].trim()) {
					maxLineHeight = Math.max(maxLineHeight, line[i][1]["line-height"], line[i][1]["font-size"]);
					fontSize = line[i][1]["font-size"] * 7;
				}
				i++;
			}
			//if we have to move the cursor to adapt the indent
			var indentMove = 0;
			var wantedIndent = 0;
			//if a margin was added (by e.g. a text-alignment), move the cursor
			if (line[0][1]["margin-left"] !== undefined && line[0][1]["margin-left"] > 0) {
				wantedIndent = this.pdf.internal.getCoordinateString(line[0][1]["margin-left"]);
				indentMove = wantedIndent - currentIndent;
				currentIndent = wantedIndent;
			}
			var indentMore = (Math.max(blockstyle["margin-left"] || 0, 0)) * fontToUnitRatio;
			//move the cursor
			out(indentMove + indentMore, (-1 * defaultFontSize * maxLineHeight).toFixed(2), "Td");
			i = 0;
			l = line.length;
			while (i !== l) {
				if (line[i][0]) {
					this.RenderTextFragment(line[i][0], line[i][1]);
				}
				i++;
			}
			this.y += maxLineHeight * fontToUnitRatio;

			//if some watcher function was executed sucessful, so e.g. margin and widths were changed,
			//reset line drawing and calculate position and lines again
			//e.g. to stop text floating around an image
			if (this.executeWatchFunctions(line[0][1]) && lines.length > 0) {
				var localFragments = [];
				var localStyles = [];
				//create fragement array of
				lines.forEach(function(localLine) {
					var i = 0;
					var l = localLine.length;
					while (i !== l) {
						if (localLine[i][0]) {
							localFragments.push(localLine[i][0]+' ');
							localStyles.push(localLine[i][1]);
						}
						++i;
					}
				});
				//split lines again due to possible coordinate changes
				lines = this.splitFragmentsIntoLines(PurgeWhiteSpace(localFragments), localStyles);
				//reposition the current cursor
				out("ET", "Q");
				out("q", "BT 0 g", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");
			}

		}
		if (cb && typeof cb === "function") {
			cb.call(this, this.x - 9, this.y - fontSize / 2);
		}
		out("ET", "Q");
		return this.y += paragraphspacing_after;
	};
	Renderer.prototype.setBlockBoundary = function (cb) {
		return this.renderParagraph(cb);
	};
	Renderer.prototype.setBlockStyle = function (css) {
		return this.paragraph.blockstyle = css;
	};
	Renderer.prototype.addText = function (text, css) {
		this.paragraph.text.push(text);
		return this.paragraph.style.push(css);
	};
	FontNameDB = {
		helvetica         : "helvetica",
		"sans-serif"      : "helvetica",
		"times new roman" : "times",
		serif             : "times",
		times             : "times",
		monospace         : "courier",
		courier           : "courier"
	};
	FontWeightMap = {
		100 : "normal",
		200 : "normal",
		300 : "normal",
		400 : "normal",
		500 : "bold",
		600 : "bold",
		700 : "bold",
		800 : "bold",
		900 : "bold",
		normal  : "normal",
		bold    : "bold",
		bolder  : "bold",
		lighter : "normal"
	};
	FontStyleMap = {
		normal  : "normal",
		italic  : "italic",
		oblique : "italic"
	};
	TextAlignMap = {
		left    : "left",
		right   : "right",
		center  : "center",
		justify : "justify"
	};
	FloatMap = {
		none : 'none',
		right: 'right',
		left: 'left'
	};
	ClearMap = {
	  none : 'none',
	  both : 'both'
	};
	UnitedNumberMap = {
		normal : 1
	};
	/**
	 * Converts HTML-formatted text into formatted PDF text.
	 *
	 * Notes:
	 * 2012-07-18
	 * Plugin relies on having browser, DOM around. The HTML is pushed into dom and traversed.
	 * Plugin relies on jQuery for CSS extraction.
	 * Targeting HTML output from Markdown templating, which is a very simple
	 * markup - div, span, em, strong, p. No br-based paragraph separation supported explicitly (but still may work.)
	 * Images, tables are NOT supported.
	 *
	 * @public
	 * @function
	 * @param HTML {String or DOM Element} HTML-formatted text, or pointer to DOM element that is to be rendered into PDF.
	 * @param x {Number} starting X coordinate in jsPDF instance's declared units.
	 * @param y {Number} starting Y coordinate in jsPDF instance's declared units.
	 * @param settings {Object} Additional / optional variables controlling parsing, rendering.
	 * @returns {Object} jsPDF instance
	 */
	jsPDFAPI.fromHTML = function (HTML, x, y, settings, callback, margins) {
		"use strict";

		this.margins_doc = margins || {
			top : 0,
			bottom : 0
		};
		if (!settings)
			settings = {};
		if (!settings.elementHandlers)
			settings.elementHandlers = {};

		return process(this, HTML, isNaN(x) ? 4 : x, isNaN(y) ? 4 : y, settings, callback);
	};
})(jsPDF.API);
