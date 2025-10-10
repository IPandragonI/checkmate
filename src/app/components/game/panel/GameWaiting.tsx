import GameCodeField from "@/app/components/field/GameCodeField";
import Loader from "@/app/utils/Loader";
import {Component} from "react";

class GameWaiting extends Component<{ value: any }> {
    render() {
        return <div
            className="flex flex-col h-full p-8 rounded-lg gap-6 border border-gray-200 shadow-lg fieldset bg-base-200 overflow-y-auto">
        <div className="text-2xl font-semibold mb-4">En attente d&#39;un adversaire...</div>
        <GameCodeField value={this.props.value}/>
        <Loader/>
        </div>;
    }
}

export default GameWaiting;
