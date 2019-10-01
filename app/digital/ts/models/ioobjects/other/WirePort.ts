import {IO_PORT_RADIUS} from "digital/utils/Constants";

import {Vector, V} from "Vector";
import {CircleContains} from "math/MathUtils";
import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/DigitalComponent";

export class WirePort extends DigitalComponent {

    public constructor() {
        super(new ClampedValue(1,1,1), new ClampedValue(1,1,1), V(2*IO_PORT_RADIUS, 2*IO_PORT_RADIUS));

        // Set origin = target position so that they overlap and look like 1 dot
        this.inputs.first.setTargetPos(this.inputs.first.getOriginPos());
        this.outputs.first.setTargetPos(this.outputs.first.getOriginPos());
    }

    // @Override
    public activate(): void {
        super.activate(this.inputs.first.getIsOn());
    }

    public isWithinSelectBounds(v: Vector): boolean {
        return CircleContains(this.getPos(), this.getSize().x, v);
    }

    public getInputDir(): Vector {
        return this.transform.getMatrix().mul(V(-1, 0)).sub(this.getPos()).normalize();
    }

    public getOutputDir(): Vector {
        return this.transform.getMatrix().mul(V( 1, 0)).sub(this.getPos()).normalize();
    }

    public getDisplayName(): string {
        return "Port";
    }

    public getXMLName(): string {
        return "port";
    }
}
