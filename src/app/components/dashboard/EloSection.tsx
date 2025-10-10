function EloSection({user}: { user?: any }) {
    return (
        <div className="bg-primary rounded-xl h-32 text-xl font-semibold lg:block hidden">
            <div className="h-full flex flex-col justify-center items-center text-center text-white font-bold gap-2">
                <p className="text-5xl lg:text-6xl">{user?.elo || 0}</p>
                <p className="text-sm">Classement actuel</p>
            </div>
        </div>
    );
}

export default EloSection;