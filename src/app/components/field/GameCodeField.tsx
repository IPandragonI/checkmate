import {Component} from "react";
import {Copy} from "lucide-react";
import Swal from "sweetalert2";

class GameCodeField extends Component<{ value: string }> {
    handleClick = () => {
        navigator.clipboard.writeText(this.props.value);
        Swal.fire({
            icon: "success",
            title: "Code copié !",
            showConfirmButton: false,
            timer: 1500,
        });
    }
    render() {
        return <div className="form-control">
            <label className="label">Code d'accès</label>
            <div className="flex items-center mt-2">
                <input type="text" className="input input-bordered w-full" value={this.props.value} readOnly/>
                <button type="button" className="btn btn-square btn-primary ml-2"
                        onClick={this.handleClick}>
                    <Copy size={20}/>
                </button>
            </div>
        </div>;
    }
}

export default GameCodeField;