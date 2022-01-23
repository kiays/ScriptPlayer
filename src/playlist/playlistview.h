#ifndef PLAYLISTVIEW_H
#define PLAYLISTVIEW_H

#include <QDropEvent>
#include <QObject>
#include <QTableView>
#include <QWidget>
#include <QMimeData>
class PlaylistView : public QTableView {
  Q_OBJECT
public:
  PlaylistView(QWidget *parent = nullptr);

signals:
    void audioFileDropped(QString file_name);

private:
  void dragEnterEvent(QDragEnterEvent *event) override;
  void dragMoveEvent(QDragMoveEvent *event) override;
  void dropEvent(QDropEvent *event) override;
};

#endif // PLAYLISTVIEW_H
