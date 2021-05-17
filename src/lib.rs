use deno_core::error::anyhow;
use deno_core::error::bad_resource_id;
use deno_core::error::AnyError;
use deno_core::futures::channel::mpsc::channel;
use deno_core::futures::channel::mpsc::Receiver;
use deno_core::futures::channel::mpsc::Sender;
use deno_core::futures::StreamExt;
use deno_core::op_async;
use deno_core::op_sync;
use deno_core::serde::Deserialize;
use deno_core::serde::Serialize;
use deno_core::Extension;
use deno_core::OpState;
use deno_core::Resource;
use deno_core::ResourceId;
use deno_core::ZeroCopyBuf;

use std::borrow::Cow;
use std::cell::RefCell;
use std::rc::Rc;

use webview_official::SizeHint;
use webview_official::Webview;
use webview_official::Window;

#[derive(Serialize, Clone)]
struct WebviewEvent {
  name: String,
  seq: String,
  req: String,
}

struct WebviewResource {
  inner: RefCell<Webview>,
  event_tx: Sender<WebviewEvent>,
  event_rx: RefCell<Receiver<WebviewEvent>>,
}

impl WebviewResource {
  fn new(debug: bool, window: Option<&mut Window>) -> Self {
    let (tx, rx) = channel::<WebviewEvent>(1);
    WebviewResource {
      inner: RefCell::new(Webview::create(debug, window)),
      event_tx: tx,
      event_rx: RefCell::new(rx),
    }
  }

  fn bind(&self, name: &str) {
    let mut webview = self.inner.borrow_mut();
    let mut tx = self.event_tx.clone();

    webview.bind(name, move |seq, req| {
      // println!("{} {}", seq, req);
      tx.try_send(WebviewEvent {
        name: name.to_string(),
        seq: seq.to_string(),
        req: req.to_string(),
      })
      .unwrap();
    });
  }

  async fn next_event(&self) -> Option<WebviewEvent> {
    self.event_rx.borrow_mut().next().await
  }
}

impl Resource for WebviewResource {
  fn name(&self) -> Cow<str> {
    "webview".into()
  }
}

#[derive(Deserialize, Debug)]
struct StringArgs {
  rid: ResourceId,
  val: String,
}

#[derive(Deserialize)]
struct SizeArgs {
  rid: ResourceId,
  width: i32,
  height: i32,
  size: i32,
}

#[derive(Deserialize)]
struct ReturnArgs {
  rid: ResourceId,
  seq: String,
  status: i32,
  result: String,
}

#[no_mangle]
pub fn init() -> Extension {
  Extension::builder()
    .ops(vec![
      ("webview_create", op_sync(webview_create)),
      ("webview_run", op_async(webview_run)),
      ("webview_terminate", op_sync(webview_terminate)),
      ("webview_set_title", op_sync(webview_set_title)),
      ("webview_set_size", op_sync(webview_set_size)),
      ("webview_navigate", op_sync(webview_navigate)),
      ("webview_init", op_sync(webview_init)),
      ("webview_eval", op_sync(webview_eval)),
      ("webview_bind", op_sync(webview_bind)),
      ("webview_return", op_sync(webview_return)),
      ("webview_poll_next", op_async(webview_poll_next)),
    ])
    .build()
}

fn webview_create(
  state: &mut OpState,
  debug: bool,
  _zero_copy: Option<ZeroCopyBuf>,
) -> Result<ResourceId, AnyError> {
  Ok(state.resource_table.add(WebviewResource::new(debug, None)))
}

async fn webview_run(
  state: Rc<RefCell<OpState>>,
  rid: ResourceId,
  _zero_copy: Option<ZeroCopyBuf>,
) -> Result<(), AnyError> {
  let webview = state
    .borrow()
    .resource_table
    .get::<WebviewResource>(rid)
    .ok_or_else(bad_resource_id)?;

  webview.inner.borrow_mut().run();

  Ok(())
}

fn webview_terminate(
  state: &mut OpState,
  rid: ResourceId,
  _zero_copy: Option<ZeroCopyBuf>,
) -> Result<(), AnyError> {
  let webview = state
    .resource_table
    .get::<WebviewResource>(rid)
    .ok_or_else(bad_resource_id)?;

  webview.inner.borrow_mut().terminate();

  Ok(())
}

fn webview_set_title(
  state: &mut OpState,
  args: StringArgs,
  _zero_copy: Option<ZeroCopyBuf>,
) -> Result<(), AnyError> {
  let webview = state
    .resource_table
    .get::<WebviewResource>(args.rid)
    .ok_or_else(bad_resource_id)?;

  webview.inner.borrow_mut().set_title(&args.val);

  Ok(())
}

fn webview_set_size(
  state: &mut OpState,
  args: SizeArgs,
  _zero_copy: Option<ZeroCopyBuf>,
) -> Result<(), AnyError> {
  let webview = state
    .resource_table
    .get::<WebviewResource>(args.rid)
    .ok_or_else(bad_resource_id)?;

  webview.inner.borrow_mut().set_size(
    args.width,
    args.height,
    match args.size {
      0 => SizeHint::NONE,
      1 => SizeHint::MIN,
      2 => SizeHint::MAX,
      3 => SizeHint::FIXED,
      _ => return Err(anyhow!("Size hint needs to be in range 0..3")),
    },
  );

  Ok(())
}

fn webview_navigate(
  state: &mut OpState,
  args: StringArgs,
  _zero_copy: Option<ZeroCopyBuf>,
) -> Result<(), AnyError> {
  let webview = state
    .resource_table
    .get::<WebviewResource>(args.rid)
    .ok_or_else(bad_resource_id)?;

  webview.inner.borrow_mut().navigate(&args.val);

  Ok(())
}

fn webview_init(
  state: &mut OpState,
  args: StringArgs,
  _zero_copy: Option<ZeroCopyBuf>,
) -> Result<(), AnyError> {
  let webview = state
    .resource_table
    .get::<WebviewResource>(args.rid)
    .ok_or_else(bad_resource_id)?;

  webview.inner.borrow_mut().init(&args.val);

  Ok(())
}

fn webview_eval(
  state: &mut OpState,
  args: StringArgs,
  _zero_copy: Option<ZeroCopyBuf>,
) -> Result<(), AnyError> {
  let webview = state
    .resource_table
    .get::<WebviewResource>(args.rid)
    .ok_or_else(bad_resource_id)?;

  webview.inner.borrow_mut().eval(&args.val);

  Ok(())
}

fn webview_bind(
  state: &mut OpState,
  args: StringArgs,
  _zero_copy: Option<ZeroCopyBuf>,
) -> Result<(), AnyError> {
  let webview = state
    .resource_table
    .get::<WebviewResource>(args.rid)
    .ok_or_else(bad_resource_id)?;

  webview.bind(&args.val);

  Ok(())
}

fn webview_return(
  state: &mut OpState,
  args: ReturnArgs,
  _zero_copy: Option<ZeroCopyBuf>,
) -> Result<(), AnyError> {
  let webview = state
    .resource_table
    .get::<WebviewResource>(args.rid)
    .ok_or_else(bad_resource_id)?;

  webview
    .inner
    .borrow()
    .r#return(&args.seq, args.status, &args.result);

  Ok(())
}

async fn webview_poll_next(
  state: Rc<RefCell<OpState>>,
  rid: ResourceId,
  _zero_copy: Option<ZeroCopyBuf>,
) -> Result<Option<WebviewEvent>, AnyError> {
  let webview = state
    .borrow()
    .resource_table
    .get::<WebviewResource>(rid)
    .ok_or_else(bad_resource_id)?;

  Ok(webview.next_event().await)
}
