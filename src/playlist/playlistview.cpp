#include "playlistview.h"

PlaylistView::PlaylistView(QWidget *parent) : QTableView(parent) {
  setAcceptDrops(true);
  setSelectionMode(QAbstractItemView::SelectionMode::SingleSelection);
  setSelectionBehavior(QAbstractItemView::SelectionBehavior::SelectRows);
  setSortingEnabled(true);
}
void PlaylistView::dragEnterEvent(QDragEnterEvent *event) {
  // if (event->mimeData()->hasFormat("text/plain"))
 
    const auto* mimeData = event->mimeData();
  //   qDebug()<<mimeData->text();
    qDebug() << mimeData->hasFormat("audio/x-mp3");
  event->acceptProposedAction();
}
void PlaylistView::dragMoveEvent(QDragMoveEvent *event) {
  // if (event->mimeData()->hasFormat("text/plain"))
  event->acceptProposedAction();
}

void PlaylistView::dropEvent(QDropEvent *event) {
  event->acceptProposedAction();
  QString file_name_str = event->mimeData()->text();
  QStringList file_names = file_name_str.split("\n");
    for (auto &file_name : file_names) {
      qDebug() << file_name;
        emit audioFileDropped(file_name); 
    }
}
