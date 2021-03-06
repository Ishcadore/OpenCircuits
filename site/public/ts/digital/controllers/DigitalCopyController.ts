import {V} from "Vector";
import {IOObjectSet, SerializeForCopy} from "core/utils/ComponentUtils";

import {GroupAction} from "core/actions/GroupAction";
import {CreateGroupTranslateAction} from "core/actions/transform/TranslateAction";
import {CreateGroupSelectAction,
        CreateDeselectAllAction} from "core/actions/selection/SelectAction";
import {CreateAddGroupAction} from "core/actions/addition/AddGroupActionFactory";
import {TransferICDataAction} from "digital/actions/TransferICDataAction";

import {IOObject} from "core/models/IOObject";
import {IC} from "digital/models/ioobjects/other/IC";

import {CopyController} from "../../shared/controllers/CopyController";
import {DigitalCircuitController} from "./DigitalCircuitController";
import {Deserialize} from "serialeazy";
import {Component} from "core/models/Component";

export class DigitalCopyController extends CopyController {

    public constructor(main: DigitalCircuitController) {
        super(main);
    }

    protected copy(e: ClipboardEvent, main: DigitalCircuitController): void {
        const selections = main.getSelections();
        const objs = selections.filter((o) => o instanceof IOObject) as IOObject[];

        // Export the circuit as XML and put it in the clipboard
        e.clipboardData.setData("text/json", SerializeForCopy(objs));
        e.preventDefault();
    }

    protected paste(e: ClipboardEvent, main: DigitalCircuitController): void{
        // Load clipboard data and deserialize
        const contents = e.clipboardData.getData("text/json");
        const objs = Deserialize<IOObject[]>(contents);

        const mainDesigner = main.getDesigner();

        // Find ICs and ICData
        const ics = objs.filter((obj) => obj instanceof IC) as IC[];
        const icData = [...new Set(ics.map((ic) => ic.getData()))]; // Get unique ICData

        // Get all components
        const components = objs.filter((obj) => obj instanceof Component) as Component[];
        const action = new GroupAction();

        // Transfer the IC data over
        action.add(new TransferICDataAction(icData, mainDesigner));

        // Add each wire and object
        action.add(CreateAddGroupAction(mainDesigner, new IOObjectSet(objs)));

        // Deselect current selections, then select new objs
        action.add(CreateDeselectAllAction(main.getSelectionTool()));
        action.add(CreateGroupSelectAction(main.getSelectionTool(), components));

        // Translate the copies over a bit
        action.add(CreateGroupTranslateAction(components, components.map((o) => o.getPos().add(V(5, 5)))));

        main.addAction(action.execute());
        main.render();
    }

}
