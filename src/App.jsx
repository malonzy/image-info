import SpinningLoader from "./components/SpinningLoader.jsx";
import {useEffect, useRef, useState} from "react";
import axios from "axios";

function App(){
    const [url,setUrl] = useState('')
    const [loading,setLoading] = useState(false)
    const [image,setImage] = useState(null)
    const [imageInfo,setImageInfo] = useState({})
    const imgRef = useRef()
    const [errMsg,setErrMsg] = useState('')

    function sizeSuffix(size){
        return {
            kb:Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(size / 1000)+' KB',
            mb:Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(size / 1000000)+' MB'
        }
    }

    function getImageInfo(e){
        e.preventDefault()

        if (!url){
            setErrMsg('Provide a url')
            return
        }

        setLoading(true)
        setImage(null)
        setImageInfo({})
        setErrMsg('')
        axios.get(url,{responseType:'blob'}).then(res => {
            if (res.headers["content-type"].startsWith('image/')){
                setImageInfo({
                    size:sizeSuffix(res.data.size),
                    type:res.headers['content-type']
                })
                setImage(URL.createObjectURL(res.data))
            }else{
                setErrMsg('URL provided does not link to an image')
            }
        }).catch(err => {
            console.log(err)
            setErrMsg('Could not information from link provided')
        })
            .finally(()=>{
            setLoading(false)
        })
    }

    async function handlePaste(e){
        setImage(null)
        setImageInfo({})
        setErrMsg('')
        const clipboardItem = typeof navigator?.clipboard?.read === 'function' ? await navigator.clipboard.read() : e.clipboardData.files
        let blob;
        if (clipboardItem.type?.startsWith('image/')) {
            // For files from `e.clipboardData.files`.
            blob = clipboardItem
            // Do something with the blob.
            setImage(URL.createObjectURL(blob));
        } else {
            // For files from `navigator.clipboard.read()`.
            const imageTypes = clipboardItem[0].types?.filter(type => type.startsWith('image/'))
            for (const imageType of imageTypes) {
                blob = await clipboardItem[0].getType(imageType);
                // Do something with the blob.
                setImage(URL.createObjectURL(blob))
            }
        }
    }

    return (
        <main className="w-full md:w-7/12 mx-auto">
            <h1 className="text-2xl font-bold text-center">Image Information Viewer</h1>
            <form onSubmit={getImageInfo} className="mt-4 flex items-center gap-4">
                <input type="text" placeholder="Image URL"
                       className="border-2 border-emerald-600 w-full rounded-xl p-4 text-xl focus-within:outline-emerald-800 focus-visible:outline-emerald-800 focus:border-emerald-800"
                       autoFocus value={url} onChange={(e) => {
                    setUrl(e.target.value)
                }} onPaste={handlePaste}/>
                <button type="submit" className="w-fit text-nowrap bg-emerald-950 text-white rounded-xl p-4">Extract
                    Data
                </button>
            </form>
            {(image) ?
                <div className="mt-4 bg-emerald-50/70 min-h-52 rounded-xl">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-0 border-b py-5">
                        {imageInfo.size && <div className="flex justify-around w-full">
                            <div className="w-full text-center">
                                <h4 className="font-bold text-emerald-800 text-lg">Size in MB</h4>
                                <p>{imageInfo.size.mb}</p>
                            </div>
                            <div className="w-full text-center">
                                <h4 className="font-bold text-emerald-800 text-lg">Size in KB</h4>
                                <p>{imageInfo.size.kb}</p>
                            </div>
                        </div>
                        }
                        <div className="flex justify-around w-full">
                            <div className="w-full text-center">
                                <h4 className="font-bold text-emerald-800 text-lg">Width</h4>
                                {imageInfo.width && <p>{imageInfo.width + 'px'}</p>}
                            </div>
                            <div className="w-full text-center">
                                <h4 className="font-bold text-emerald-800 text-lg">Height</h4>
                                {imageInfo.height && <p>{imageInfo.height + 'px'}</p>}
                            </div>
                            {imageInfo.type && <div className="w-full text-center">
                                <h4 className="font-bold text-emerald-800 text-lg">Type</h4>
                                <p>{imageInfo.type}</p>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="py-5 flex justify-center">
                        {image && <img src={image} ref={imgRef} onLoad={(e)=>{
                            const info = {...imageInfo}
                            setImageInfo({
                                ...info,
                                height:e.target.naturalHeight,
                                width:e.target.naturalWidth
                            })
                        }}/>}
                    </div>
                </div>
                :
                <div className="mt-4 bg-emerald-50 min-h-52 rounded-xl">
                    <div className="flex flex-col h-52 justify-center items-center text-gray-600 gap-5">
                        <i className="fa-duotone fa-image fa-4x"></i>
                        {loading ?
                            <p className="flex items-center gap-2">
                                <SpinningLoader/>
                                <span>Loading image info...</span>
                            </p>
                            :
                            <div>
                                <p>Paste a link to an image in the text field to view the information here.</p>
                                {errMsg && <p className="text-red-400 text-center pb-3">{errMsg}</p>}
                            </div>
                        }
                    </div>
                </div>
            }
        </main>
    )
}

export default App