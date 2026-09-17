import { Divider } from "@wangxiaojinger/qizhi-react";

const sentence = "A design is a plan or specification for the construction of an object.";
const mediaItems = [
  ["图", "Image", "May 4, 2010"],
  ["人", "Avatar", "May 4, 2010"],
  ["编", "Icon", "May 4, 2010"],
] as const;

export default function BasicDemo() {
  return (
    <div className="divider-basic-demo">
      <div className="divider-demo-panel">
        <p>{sentence}</p>
        <Divider />
        <p>{sentence}</p>
        <Divider lineStyle="dashed" />
        <p>{sentence}</p>
        <Divider lineStyle="dotted" />
        <p>{sentence}</p>
      </div>
      <div className="divider-demo-panel divider-demo-panel--cards">
        {mediaItems.map(([avatar, title, date], index) => (
          <div key={title}>
            {index > 0 ? <Divider className="divider-list-offset" /> : null}
            <article className="divider-media-item">
              <span className="divider-media-item__avatar" aria-hidden="true">{avatar}</span>
              <div><h3>{title}</h3><p>{date}</p></div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
