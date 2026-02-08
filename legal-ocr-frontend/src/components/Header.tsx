/**
 * Header component with Jus Team branding
 * Uses inline styles to ensure proper centering in flex context
 */
export function Header() {
    return (
        <header
            className="bg-white border-b border-gray-200 sticky top-0 z-50"
            style={{ width: '100%' }}
        >
            <div
                className="px-4 py-4"
                style={{
                    maxWidth: '64rem', /* 1024px = max-w-5xl */
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}
            >
                <div className="flex items-center gap-4">
                    <img
                        src="https://img.xico.uk/logo.png"
                        alt="Jus Team Logo"
                        className="h-10 w-auto"
                    />
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            PDF Converter
                        </h1>
                        <p className="text-sm text-gray-500">Jus Team 效率提升计划</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
