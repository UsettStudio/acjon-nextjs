import AnimatedCounterTwo from "@/components/shared/Counter/AnimatedCounterTwo";
import { AboutFunfactsData } from "@/data/funfactData";

interface FunfactCircleProps {
  item: typeof AboutFunfactsData[number];
}

const FunfactCircle: React.FC<FunfactCircleProps> = ({ item }) => {
  return (
    <div
      className={`${item.className} tp_fade_anim`}
      data-delay={item.delay}
      data-duration="1"
      data-fade-from="top"
      data-ease="bounce"
      style={item.style}
    >
      <h4 className={item.titleClass}>
        <AnimatedCounterTwo min={item.min} max={item.max} />
        {item.suffix}
      </h4>
      <span className={item.labelClass}>{item.label}</span>
    </div>
  );
};
export default FunfactCircle;
