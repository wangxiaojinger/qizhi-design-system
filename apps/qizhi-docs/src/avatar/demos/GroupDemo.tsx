import { Avatar } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <div className="avatar-docs-stack">
      <Avatar.Group>
        <Avatar>A</Avatar>
        <Avatar className="avatar-docs-brand">B</Avatar>
        <Avatar className="avatar-docs-cyan">C</Avatar>
        <Avatar className="avatar-docs-more">+3</Avatar>
      </Avatar.Group>
      <Avatar.Group size="small">
        <Avatar>A</Avatar>
        <Avatar className="avatar-docs-brand">B</Avatar>
        <Avatar className="avatar-docs-cyan">C</Avatar>
        <Avatar className="avatar-docs-more">+3</Avatar>
      </Avatar.Group>
    </div>
  );
};

export default App;
