import AnimatedButton from '@/components/ui/Animbutton';
const WaveTextEffect = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center relative">
      <div className="relative z-10 mb-20 sm:mb-0">
        <h1 className="text-7xl md:text-9xl font-bold text-violet-200 text-center">
          CHAT <span className='text-violet-500'>APP</span>
        </h1>
        <h3 className="text-3xl md:text-[2.5rem] font-semibold mix-blend-overlay bg-transparent text-center mt-6 bg-gradient-to-r from-violet-100  to-violet-600 bg-clip-text text-transparent">
          Chat with the server
        </h3>
        <div className="flex justify-around mt-16">
        <AnimatedButton text={"Register"} link='/register'/>
        <AnimatedButton text={"Login"} link='/login'/>
        </div>
      </div>
    </div>
  );
};

export default WaveTextEffect;