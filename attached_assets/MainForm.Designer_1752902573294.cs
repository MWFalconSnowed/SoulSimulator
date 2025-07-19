using System.Drawing;
using System.Windows.Forms;
using System.Drawing;

namespace SoulScriptWinForms {
    partial class MainForm {
        private System.ComponentModel.IContainer components = null;
        private System.Windows.Forms.RichTextBox editorTextBox;
        private System.Windows.Forms.Button runButton;
        private System.Windows.Forms.TextBox outputBox;
        private System.Windows.Forms.Button openButton;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Panel headerPanel;

        protected override void Dispose(bool disposing) {
            if (disposing && (components != null)) {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        private void InitializeComponent() {
            this.editorTextBox = new System.Windows.Forms.RichTextBox();
            this.runButton = new System.Windows.Forms.Button();
            this.outputBox = new System.Windows.Forms.TextBox();
            this.openButton = new System.Windows.Forms.Button();
            this.SuspendLayout();
            this.headerPanel = new System.Windows.Forms.Panel();
            this.headerPanel.Dock = System.Windows.Forms.DockStyle.Top;
            this.headerPanel.Height = 40;
            this.headerPanel.BackColor = Color.FromArgb(18, 18, 20);
            this.Controls.Add(this.headerPanel);
// Editor
editorTextBox.Multiline = true;
editorTextBox.Dock = DockStyle.Top;
editorTextBox.Height = this.ClientSize.Height / 2;

// Output
outputBox.Multiline = true;
outputBox.Dock = DockStyle.Fill;
outputBox.ScrollBars = ScrollBars.Vertical;

// Panel de boutons (optionnel)
Panel buttonPanel = new Panel();
buttonPanel.Dock = DockStyle.Top;
buttonPanel.Height = 35;
buttonPanel.BackColor = Color.Transparent;
buttonPanel.Controls.Add(openButton);
buttonPanel.Controls.Add(runButton);
this.Controls.Add(buttonPanel);

            this.editorTextBox.Location = new System.Drawing.Point(12, 12);
            this.editorTextBox.Name = "editorTextBox";
            this.editorTextBox.Size = new System.Drawing.Size(560, 300);
            this.editorTextBox.TabIndex = 0;
            this.editorTextBox.Text = "";
            // 
            // runButton
            // 
            this.runButton.Location = new System.Drawing.Point(93, 320);
            this.runButton.Name = "runButton";
            this.runButton.Size = new System.Drawing.Size(75, 23);
            this.runButton.TabIndex = 1;
            this.runButton.Text = "Run";
            this.runButton.UseVisualStyleBackColor = true;
            this.runButton.Click += new System.EventHandler(this.runButton_Click);
            // 
            // openButton
            // 
            this.openButton.Location = new System.Drawing.Point(12, 320);
            this.openButton.Name = "openButton";
            this.openButton.Size = new System.Drawing.Size(75, 23);
            this.openButton.TabIndex = 3;
            this.openButton.Text = "Open";
            this.openButton.UseVisualStyleBackColor = true;
            this.openButton.Click += new System.EventHandler(this.openButton_Click);
            // 
            // outputBox
            // 
            this.outputBox.Location = new System.Drawing.Point(12, 350);
            this.outputBox.Multiline = true;
            this.outputBox.Name = "outputBox";
            this.outputBox.ReadOnly = true;
            this.outputBox.Size = new System.Drawing.Size(560, 100);
            this.outputBox.TabIndex = 2;
            // 
            // MainForm
            // 
            this.ClientSize = new System.Drawing.Size(584, 461);
            this.Controls.Add(this.openButton);
            this.Controls.Add(this.outputBox);
            this.Controls.Add(this.runButton);
            this.Controls.Add(this.editorTextBox);
            this.Name = "MainForm";
            this.Text = "SoulScript Editor";
            this.ResumeLayout(false);
            this.PerformLayout();
        }
    }
}
