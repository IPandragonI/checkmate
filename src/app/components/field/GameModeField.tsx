import {Component} from "react";

class GameModeField extends Component<{ mode: string, onClick: () => void, onClick1: () => void }> {
    render() {
        return <div className="form-control">
            <div className="flex justify-center">
                <div role="tablist" className="tabs tabs-boxed bg-base-200 rounded-lg p-1 justify-center">
                    <button
                        type="button"
                        role="tab"
                        className={`tab font-semibold px-6 py-2 rounded-lg transition-colors duration-200 ${this.props.mode === "online" ? "bg-primary text-white shadow hover:text-white" : "bg-base-100 text-primary"}`}
                        onClick={this.props.onClick}
                        aria-selected={this.props.mode === "online"}
                    >
                        En ligne
                    </button>
                    <button
                        type="button"
                        role="tab"
                        className={`tab font-semibold px-6 py-2 rounded-lg transition-colors duration-200 ml-2 ${this.props.mode === "bot" ? "bg-secondary text-white shadow hover:text-white" : "bg-base-100 text-secondary"}`}
                        onClick={this.props.onClick1}
                        aria-selected={this.props.mode === "bot"}
                    >
                        Contre un bot
                    </button>
                </div>
            </div>
        </div>;
    }
}

export default GameModeField;