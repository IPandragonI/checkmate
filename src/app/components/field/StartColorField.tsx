import {Component} from "react";
import ColorCard from "@/app/components/field/ColorCard";
import Svg from "@/app/utils/Svg";
import {Dices} from "lucide-react";

class StartColorField extends Component<{
    color: string,
    onClick: () => void,
    onClick1: () => void,
    onClick2: () => void
}> {
    render() {
        return <div className="form-control">
            <label className="label">Couleur</label>
            <div className="flex gap-4 justify-center">
                <ColorCard
                    selected={this.props.color === "white"}
                    onClick={this.props.onClick}
                    label={"Blanc"}
                    icon={<Svg src="/pieces/wP.svg" alt="Blanc" width={22} height={22}/>}/>
                <ColorCard
                    selected={this.props.color === "black"}
                    onClick={this.props.onClick1}
                    label="Noir"
                    icon={<Svg src="/pieces/bP.svg" alt="Noir" width={22} height={22}/>}
                    ariaLabel="Choisir noir"
                />
                <ColorCard
                    selected={this.props.color === "random"}
                    onClick={this.props.onClick2}
                    label="Aléatoire"
                    icon={<Dices size={22} color={this.props.color === "random" ? "white" : "black"}/>}
                    ariaLabel="Choisir aléatoire"
                />
            </div>
        </div>;
    }
}

export default StartColorField;