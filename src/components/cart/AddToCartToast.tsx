import React from 'react';
import { ShoppingCart, X, MoveRight } from 'lucide-react';
import { toast } from 'sonner';

interface AddToCartToastProps {
    productName: string;
    productPrice: number;
    productImage: string;
    toastId: string | number;
}

const AddToCartToast = ({ productName, productPrice, productImage, toastId }: AddToCartToastProps) => {
    return (
        <div className="w-[360px] h-[150px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[15px] shadow-2xl overflow-hidden p-0 animate-in fade-in slide-in-from-right-5">
            <div className="flex flex-row items-center w-full h-full">
                <div className="w-[20%] flex justify-center">
                    <div className="bg-[#1a1a1a2f] w-[3em] h-[3em] rounded-full overflow-hidden flex items-center justify-center">
                        <img src={productImage} alt="" className="w-full h-full object-cover" />
                    </div>
                </div>

                <div className="w-[80%] flex flex-col justify-center pr-3">
                    <div className="flex items-baseline justify-between w-full">
                        <span className="text-[1em] font-semibold text-[#1b1b1b] pl-[10px] pt-[20px]">Added to cart!</span>
                        <button
                            onClick={() => toast.dismiss(toastId)}
                            className="px-[30px] opacity-20 hover:opacity-60 transition-opacity cursor-pointer pt-[20px]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height={15} width={15} viewBox="0 0 384 512" className="fill-black/20 hover:fill-black/60 transition-colors">
                                <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                            </svg>
                        </button>
                    </div>

                    <div className="text-[0.8em] text-[#2c2c2c] pt-[10px] pl-[10px] hover:underline cursor-pointer truncate">
                        {productName}
                    </div>

                    <div className="text-[0.9em] font-semibold text-[#333] pl-[10px] pb-[10px]">
                        ₹{productPrice.toLocaleString()}
                    </div>

                    <div className="flex pl-[10px]">
                        <button
                            onClick={() => window.location.href = "/cart"}
                            className="group relative h-[35px] px-5 bg-[#050505] rounded-full flex items-center justify-center text-white gap-[10px] font-bold text-[15px] border-[3px] border-white/30 shadow-2xl hover:scale-[1.05] transition-all outline-none overflow-hidden cursor-pointer"
                        >
                            <span className="relative z-10">View cart</span>
                            <svg className="relative z-10 h-6 w-6 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
                            </svg>

                            {/* Shine effect */}
                            <div className="absolute top-0 -left-[100px] w-[100px] h-full bg-linear-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] group-hover:animate-[shine_1.5s_ease-out_infinite]" />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shine {
                    0% { left: -100px; }
                    60% { left: 100%; }
                    100% { left: 100%; }
                }
            `}</style>
        </div>
    );
};

export default AddToCartToast;
