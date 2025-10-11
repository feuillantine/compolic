import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="opacity-80">ページが見つかりませんでした</p>
      <Link className="underline" to="/">
        トップへ戻る
      </Link>
    </div>
  );
}
