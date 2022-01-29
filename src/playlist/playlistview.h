#ifndef PLAYLISTVIEW_H
#define PLAYLISTVIEW_H

#include <QDropEvent>
#include <QMimeData>
#include <QObject>
#include <QTableView>
#include <QUrl>
#include <QWidget>
class PlaylistView : public QTableView {
  Q_OBJECT
public:
  PlaylistView(QWidget *parent = nullptr);

signals:
  void audioFileDropped(QString file_name);
  void csvFileDropped(QString file_name, QModelIndex const &index);

private:
  void dragEnterEvent(QDragEnterEvent *event) override;
  void dragMoveEvent(QDragMoveEvent *event) override;
  void dropEvent(QDropEvent *event) override;
};

#endif // PLAYLISTVIEW_H
