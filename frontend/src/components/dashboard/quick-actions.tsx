import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { Download, Send, Upload } from 'lucide-react'

export function QuickActions() {
    return (
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <Link to="/deposit" className="flex-1">
                <Button variant="secondary" className="w-full h-12 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Download className="w-4 h-4 text-green-400" />
                    </div>
                    Recargar
                </Button>
            </Link>
            <Link to="/transfer" className="flex-1">
                <Button variant="secondary" className="w-full h-12 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Send className="w-4 h-4 text-blue-400" />
                    </div>
                    Enviar
                </Button>
            </Link>
            <Link to="/withdraw" className="flex-1">
                <Button variant="secondary" className="w-full h-12 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Upload className="w-4 h-4 text-orange-400" />
                    </div>
                    Retirar
                </Button>
            </Link>
        </div>
    )
}
