'use client'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import Button from './ui/Button'
import { useRef } from 'react'

interface Props {
  tableNumber: string
}

const QRCodeModal = (props: Props) => {
  const { tableNumber } = props
  const qrCanvas = useRef<HTMLCanvasElement>(null)

  const handleClick = () => {
    console.log('download here')
    const imgURI = qrCanvas.current
      ?.toDataURL('image/webp')
      .replace('image/webp', 'image/octet-stream')

    if (imgURI) {
      const a = document.createElement('a')
      a.download = `QR_MENU_TABLE_${tableNumber}.webp`
      a.target = '_blank'
      a.href = imgURI
      a.click()
    }
  }

  return (
    <div className="flex flex-col justify-center gap-4 w-64 h-64 mx-auto text-center">
      <h1 className="text-3xl">Table number: {tableNumber}</h1>
      <div className="self-center">
        <QRCodeCanvas
          value={`${window.location.protocol}//${window.location.host}/${tableNumber}`}
          ref={qrCanvas}
        />
      </div>
      <Button onClick={handleClick}>Download</Button>
    </div>
  )
}

export default QRCodeModal
