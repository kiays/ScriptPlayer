#include "playlistview.h"

PlaylistView::PlaylistView(QWidget *parent) : QTableView(parent) {
  setAcceptDrops(true);
  setSelectionMode(QAbstractItemView::SelectionMode::SingleSelection);
  setSelectionBehavior(QAbstractItemView::SelectionBehavior::SelectRows);
  // setSortingEnabled(true);
}
void PlaylistView::dragEnterEvent(QDragEnterEvent *event) {
  QList<QUrl>  urls = event->mimeData()->urls();
  bool has_audio = false;
  bool has_csv = false;
  qDebug() << "formats: " << urls;
  for (QUrl &url: urls) {
    auto file_name = url.fileName();
    has_audio |= file_name.endsWith(".mp3");
    has_csv |= file_name.endsWith(".csv");
  }
  if (has_audio || has_csv) {
    event->acceptProposedAction();
    return;
  }
  event->ignore();
}
void PlaylistView::dragMoveEvent(QDragMoveEvent *event) {
  QModelIndex index = indexAt(event->position().toPoint());
  event->acceptProposedAction();
}

void PlaylistView::dropEvent(QDropEvent *event) {
  event->acceptProposedAction();
  QString file_name_str = event->mimeData()->text();
  QStringList file_names = file_name_str.split("\n");
  for (auto &file_name : file_names) {
    if (file_name.endsWith(".mp3")) {
    emit audioFileDropped(file_name);
    continue;
    } 
    if (file_name.endsWith(".csv")) {
      emit csvFileDropped(file_name, indexAt(event->position().toPoint()));
    }
  }
}
