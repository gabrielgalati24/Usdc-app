import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { Download, Send, Upload } from 'lucide-react'

export function QuickActions() {
    return (
        <div className="flex gap-3 mt-4">
            <Link to="/deposit" className="flex-1">
                <Button variant="secondary" className="w-full">
                    <Download className="w-4 h-4" />
                    Recargar
                </Button>
            </Link>
            <Link to="/transfer" className="flex-1">
                <Button variant="secondary" className="w-full">
                    <Send className="w-4 h-4" />
                    Enviar
                </Button>
            </Link>
            <Link to="/withdraw" className="flex-1">
                <Button variant="secondary" className="w-full">
                    <Upload className="w-4 h-4" />
                    Retirar
                </Button>
            </Link>
        </div>
    )
}
