import { ChoiceCard, ChoiceCardGroup } from "../choice-card/ChoiceCard";
import type {
  BasicChoiceCardsProps,
  BusinessChoiceCardsProps,
  IconChoiceCardsProps,
} from "./BusinessChoiceCards.types";

function CompleteChoiceCards({
  items,
  value,
  defaultValue,
  onChange,
  className,
  ...rest
}: BusinessChoiceCardsProps) {
  return (
    <ChoiceCardGroup
      {...rest}
      columns={2}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      className={className}
    >
      {items.map((item) => (
        <ChoiceCard key={item.value} {...item} />
      ))}
    </ChoiceCardGroup>
  );
}

export function BasicChoiceCards(props: BasicChoiceCardsProps) {
  return <CompleteChoiceCards {...props} />;
}

export function IconChoiceCards(props: IconChoiceCardsProps) {
  return <CompleteChoiceCards {...props} />;
}
