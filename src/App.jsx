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

    useEffect(()=>{
        if (image){
            const info = {...imageInfo}
            setTimeout(()=>{
                setImageInfo({
                    ...info,
                    height:imgRef.current.naturalHeight,
                    width:imgRef.current.naturalWidth
                })
            },100)
        }
    },[image])

    function sizeSuffix(size){
        return {
            kb:Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(size / 1000)+' KB',
            mb:Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(size / 1000000)+' MB'
        }
    }

    function getImageInfo(e){
        e.preventDefault()
        setLoading(true)
        setImage(null)
        setImageInfo({})
        setErrMsg('')
        axios.get(url,{responseType:'blob'}).then(res => {
            if (res.headers["content-type"].startsWith('image')){
                setImageInfo({
                    size:sizeSuffix(res.data.size)
                })
                setImage(URL.createObjectURL(res.data))
            }else{
                setErrMsg('URL provided does not link to an image')
            }
        }).catch(err => {
            console.log(err)
            setErrMsg('URL provided does not link to an image')
        })
            .finally(()=>{
            setLoading(false)
        })
    }

    return (
        <main className="w-full md:w-7/12 mx-auto">
            <h1 className="text-2xl font-bold text-center">Image Information Viewer</h1>
            <form onSubmit={getImageInfo} className="mt-4 flex items-center gap-4">
                <input type="text" placeholder="Image URL"
                       className="border-2 border-emerald-600 w-full rounded-xl p-4 text-xl focus-within:outline-emerald-800 focus-visible:outline-emerald-800 focus:border-emerald-800"
                       autoFocus value={url} onChange={(e) => {
                    setUrl(e.target.value)
                }}/>
                <button type="submit" className="w-fit text-nowrap bg-emerald-950 text-white rounded-xl p-4">Extract
                    Data
                </button>
            </form>
            {(Object.keys(imageInfo).length > 0 && image) ?
                <div className="mt-4 bg-emerald-50/70 min-h-52 rounded-xl">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-0 border-b py-5">
                        <div className="flex justify-around w-full">
                            <div className="w-full text-center">
                                <h4 className="font-bold text-emerald-800 text-lg">Size in MB</h4>
                                <p>{imageInfo.size.mb}</p>
                            </div>
                            <div className="w-full text-center">
                                <h4 className="font-bold text-emerald-800 text-lg">Size in KB</h4>
                                <p>{imageInfo.size.kb}</p>
                            </div>
                        </div>
                        <div className="flex justify-around w-full">
                            <div className="w-full text-center">
                                <h4 className="font-bold text-emerald-800 text-lg">Width</h4>
                                <p>{imageInfo.width + 'px'}</p>
                            </div>
                            <div className="w-full text-center">
                                <h4 className="font-bold text-emerald-800 text-lg">Height</h4>
                                <p>{imageInfo.height + 'px'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5">
                        {image && <img src={image} ref={imgRef}/>}
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